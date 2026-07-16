"""
Rakshak AI - Dashboard Service

Business logic for Police Command Center dashboard.
Aggregates data from all modules into dashboard panels.
"""

from datetime import datetime, timedelta, timezone
from beanie import PydanticObjectId
from app.models.complaint import Complaint, VerdictType
from app.models.fraud_node import FraudNode
from app.models.currency_check import CurrencyCheck, CurrencyVerdict
from app.models.crime_hotspot import CrimeHotspot
from app.models.alert import Alert
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverview,
    AlertItem,
    AlertsResponse,
    HighRiskAccount,
    HighRiskAccountsResponse,
    RecentComplaint,
    RecentComplaintsResponse,
    AlertEvidenceResponse,
)
from app.schemas.auth import MessageResponse
from app.middleware.exceptions import NotFoundException
from typing import Optional
from loguru import logger


class DashboardService:
    """Aggregation service for police command center dashboard."""

    async def get_overview(self) -> DashboardOverview:
        """Get command center overview statistics."""
        total_scams = await Complaint.find(Complaint.verdict == VerdictType.SCAM).count()
        total_suspicious = await Complaint.find(Complaint.verdict == VerdictType.SUSPICIOUS).count()
        total_safe = await Complaint.find(Complaint.verdict == VerdictType.SAFE).count()

        # Count unique communities = active fraud rings
        communities = await FraudNode.distinct("community")
        active_rings = len([c for c in communities if c is not None])

        # Districts at risk
        high_risk_districts = await CrimeHotspot.find(
            {"risk_level": {"$in": ["high", "critical"]}}
        ).count()

        # Counterfeit notes
        counterfeit_count = await CurrencyCheck.find(
            CurrencyCheck.prediction == CurrencyVerdict.COUNTERFEIT
        ).count()

        # Total amount saved (from blocked scams)
        scam_complaints = await Complaint.find(Complaint.verdict == VerdictType.SCAM).to_list()
        total_saved = sum(c.amount_lost or 0 for c in scam_complaints)

        # Calculate 7-day trend data
        today = datetime.now(timezone.utc)
        seven_days_ago = today - timedelta(days=6) # 7 days including today
        
        recent_complaints = await Complaint.find(Complaint.created_at >= seven_days_ago).to_list()
        
        # Initialize dictionary for last 7 days (e.g. 'Mon', 'Tue')
        daily_trends = {}
        for i in range(7):
            d = (today - timedelta(days=6-i)).strftime('%a')
            daily_trends[d] = {"scams": 0, "blocked": 0}
            
        for c in recent_complaints:
            day_str = c.created_at.strftime('%a')
            if day_str in daily_trends:
                daily_trends[day_str]["scams"] += 1
                if c.verdict in [VerdictType.SCAM, VerdictType.SUSPICIOUS]:
                    daily_trends[day_str]["blocked"] += 1
                    
        scams_last_7_days = [{"name": k, "scams": v["scams"], "blocked": v["blocked"]} for k, v in daily_trends.items()]

        # Calculate Top Fraud Rings (Communities)
        community_aggregation = await FraudNode.aggregate([
            {"$match": {"community": {"$ne": None}}},
            {"$group": {
                "_id": "$community",
                "nodes": {"$sum": 1},
                "avg_risk": {"$avg": "$risk_score"},
                "types": {"$push": "$node_type"}
            }},
            {"$sort": {"avg_risk": -1, "nodes": -1}},
            {"$limit": 3}
        ]).to_list()

        top_communities = []
        for comm in community_aggregation:
            # Find the most common node type to guess the main activity
            types = comm.get("types", [])
            main_type_enum = max(set(types), key=types.count) if types else "unknown"
            
            # Map enum to a readable string
            type_mapping = {
                "phone": "Phone Network",
                "upi": "UPI Fraud",
                "bank_account": "Money Laundering",
                "suspect": "Crime Syndicate",
                "victim": "Phishing Ring"
            }
            main_type = type_mapping.get(main_type_enum, "Digital Arrest")

            top_communities.append({
                "id": f"C-{comm['_id']}",
                "nodes": comm["nodes"],
                "risk": int(comm["avg_risk"]),
                "main_type": main_type
            })

        return DashboardOverview(
            total_scams_detected=total_scams,
            total_scams_blocked=total_scams + total_suspicious,
            active_fraud_rings=active_rings,
            districts_at_risk=high_risk_districts,
            counterfeit_notes_detected=counterfeit_count,
            total_amount_saved=total_saved,
            top_communities=top_communities,
            trends={
                "scams_last_7_days": scams_last_7_days,
                "fraud_rings_last_7_days": [],
                "complaints_last_7_days": [],
            },
            last_updated=datetime.now(timezone.utc),
        )

    async def get_alerts(
        self, severity: Optional[str], is_resolved: Optional[bool], limit: int
    ) -> AlertsResponse:
        """Get live alerts feed."""
        query = Alert.find()

        if severity:
            query = query.find(Alert.severity == severity)
        if is_resolved is not None:
            query = query.find(Alert.is_resolved == is_resolved)

        total = await query.count()
        alerts = await query.sort(-Alert.created_at).limit(limit).to_list()

        unread = await Alert.find(Alert.is_read == False).count()  # noqa: E712

        return AlertsResponse(
            alerts=[
                AlertItem(
                    id=str(a.id),
                    alert_type=a.alert_type.value,
                    severity=a.severity.value,
                    title=a.title,
                    description=a.description,
                    source_module=a.source_module,
                    reference_id=a.reference_id,
                    metadata=a.metadata,
                    state=a.state,
                    district=a.district,
                    is_read=a.is_read,
                    is_resolved=a.is_resolved,
                    created_at=a.created_at,
                )
                for a in alerts
            ],
            total=total,
            unread_count=unread,
        )

    async def get_high_risk_accounts(self, limit: int) -> HighRiskAccountsResponse:
        """Get flagged high-risk accounts from the fraud network."""
        flagged_nodes = (
            await FraudNode.find(FraudNode.is_flagged == True)  # noqa: E712
            .sort(-FraudNode.risk_score)
            .limit(limit)
            .to_list()
        )

        accounts = [
            HighRiskAccount(
                account_id=n.node_id,
                account_type=n.node_type.value,
                identifier=n.label,
                risk_score=n.risk_score,
                fraud_count=len(n.connections),
                total_amount=0,  # TODO: Compute from edges
                last_activity=n.updated_at,
            )
            for n in flagged_nodes
        ]

        return HighRiskAccountsResponse(accounts=accounts, total=len(accounts))

    async def get_recent_complaints(
        self, limit: int, state: Optional[str]
    ) -> RecentComplaintsResponse:
        """Get most recent complaints."""
        query = Complaint.find()
        if state:
            query = query.find(Complaint.state == state)

        total = await query.count()
        complaints = await query.sort(-Complaint.created_at).limit(limit).to_list()

        return RecentComplaintsResponse(
            complaints=[
                RecentComplaint(
                    complaint_id=str(c.id),
                    victim_name=c.victim_name,
                    scam_type=c.scam_type.value if c.scam_type else None,
                    amount_lost=c.amount_lost,
                    state=c.state,
                    district=c.district,
                    status=c.status.value if c.status else "reported",
                    reported_at=c.reported_at,
                )
                for c in complaints
            ],
            total=total,
        )

    async def resolve_alert(self, alert_id: str, user: User) -> MessageResponse:
        """Mark an alert as resolved."""
        alert = await Alert.get(PydanticObjectId(alert_id))
        if not alert:
            raise NotFoundException("Alert", alert_id)

        alert.is_resolved = True
        alert.resolved_by = str(user.id)
        alert.resolved_at = datetime.now(timezone.utc)
        alert.updated_at = datetime.now(timezone.utc)
        await alert.save()

        return MessageResponse(message=f"Alert {alert_id} resolved")

    async def get_alert_evidence(self, alert_id: str) -> AlertEvidenceResponse:
        """Fetch raw evidence for an alert based on its reference."""
        alert = await Alert.get(PydanticObjectId(alert_id))
        if not alert:
            raise NotFoundException("Alert", alert_id)

        evidence_text = "No additional evidence found for this alert."
        evidence_type = "text"

        if alert.reference_id:
            if alert.source_module in ["scam_detection", "citizen_shield"]:
                complaint = await Complaint.get(alert.reference_id)
                if complaint and complaint.message:
                    evidence_text = complaint.message
                    evidence_type = "transcript"
            elif alert.source_module == "fraud_network":
                node = await FraudNode.find_one(FraudNode.node_id == alert.reference_id)
                if node:
                    evidence_text = f"Entity: {node.label}\nType: {node.node_type.value}\nRisk: {node.risk_score}\n"
                    if node.properties:
                        evidence_text += "\nProperties:\n"
                        for k, v in node.properties.items():
                            evidence_text += f"- {k}: {v}\n"
                    evidence_type = "node_details"

        return AlertEvidenceResponse(
            evidence_text=evidence_text,
            evidence_type=evidence_type
        )
