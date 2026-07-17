"""
Rakshak AI - Graph Auto-Expansion Service

Automatically grows the fraud network graph from citizen reports and scam detections.
When a new complaint is filed, this service:
  1. Creates a victim node (or finds existing one) for the reporting user
  2. Creates scammer entity nodes (phone, UPI, email) if they don't exist
  3. Creates edges linking victims to scammer entities
  4. Increments edge frequency if the connection already exists

This makes the fraud network a living, self-growing intelligence graph.
"""

import re
from datetime import datetime, timezone
from typing import Optional

from app.models.fraud_node import FraudNode, NodeType
from app.models.fraud_edge import FraudEdge, EdgeType
from app.models.complaint import Complaint, VerdictType
from loguru import logger


class GraphAutoExpander:
    """Automatically creates fraud graph nodes and edges from complaint data."""

    async def expand_from_complaint(
        self,
        complaint: Complaint,
        reporter_name: str,
        reporter_id: str,
    ) -> dict:
        """
        After a complaint is persisted, auto-create nodes and edges in the fraud graph.
        Only expands the graph for SCAM or SUSPICIOUS verdicts.

        Returns a summary dict of what was created.
        """
        # Only expand for confirmed/suspicious scams
        if complaint.verdict not in (VerdictType.SCAM, VerdictType.SUSPICIOUS):
            return {"expanded": False, "reason": "Verdict is SAFE, skipping graph expansion."}

        created_nodes = []
        created_edges = []

        try:
            # ── 1. Create or find a victim node for the reporter ──────────
            victim_node_id = f"victim_user_{reporter_id}"
            victim_node = await FraudNode.find_one(FraudNode.node_id == victim_node_id)

            if not victim_node:
                victim_node = FraudNode(
                    node_id=victim_node_id,
                    node_type=NodeType.VICTIM,
                    label=reporter_name,
                    properties={
                        "name": reporter_name,
                        "source": "auto_citizen_report",
                    },
                    risk_score=10,
                )
                await victim_node.insert()
                created_nodes.append(victim_node_id)
                logger.info(f"GraphExpander: Created victim node '{reporter_name}' ({victim_node_id})")

            # ── 2. Create scammer phone node ──────────────────────────────
            if complaint.phone:
                phone_clean = self._normalize_phone(complaint.phone)
                phone_node_id = f"phone_auto_{phone_clean}"

                phone_node = await FraudNode.find_one(FraudNode.node_id == phone_node_id)
                if not phone_node:
                    # Also check if the phone already exists in the seeded data
                    phone_node = await FraudNode.find_one({
                        "node_type": "phone",
                        "properties.phone_number": {"$in": [phone_clean, complaint.phone]}
                    })

                if not phone_node:
                    phone_node = FraudNode(
                        node_id=phone_node_id,
                        node_type=NodeType.PHONE,
                        label=f"Reported: {complaint.phone[-4:]}",
                        properties={
                            "phone_number": phone_clean,
                            "source": "citizen_report",
                            "first_reported": datetime.now(timezone.utc).isoformat(),
                        },
                        risk_score=min(complaint.risk_score, 80),
                        is_flagged=complaint.risk_score >= 70,
                    )
                    await phone_node.insert()
                    created_nodes.append(phone_node_id)
                    logger.info(f"GraphExpander: Created phone node {phone_clean}")
                else:
                    # Increase risk score if reported again
                    new_score = min(100, phone_node.risk_score + 10)
                    phone_node.risk_score = new_score
                    phone_node.is_flagged = True
                    await phone_node.save()

                # Create edge: victim -> phone (called_by)
                await self._upsert_edge(
                    source=phone_node.node_id,
                    target=victim_node.node_id,
                    edge_type=EdgeType.CALLED_BY,
                    amount=complaint.amount_lost,
                    created_edges=created_edges,
                )

            # ── 3. Create scammer UPI node ────────────────────────────────
            if complaint.upi:
                upi_clean = complaint.upi.strip().lower()
                upi_node_id = f"upi_auto_{upi_clean}"

                upi_node = await FraudNode.find_one(FraudNode.node_id == upi_node_id)
                if not upi_node:
                    upi_node = await FraudNode.find_one({
                        "node_type": "upi",
                        "properties.upi_id": upi_clean
                    })

                if not upi_node:
                    upi_node = FraudNode(
                        node_id=upi_node_id,
                        node_type=NodeType.UPI,
                        label=upi_clean,
                        properties={
                            "upi_id": upi_clean,
                            "source": "citizen_report",
                            "first_reported": datetime.now(timezone.utc).isoformat(),
                        },
                        risk_score=min(complaint.risk_score, 80),
                        is_flagged=complaint.risk_score >= 70,
                    )
                    await upi_node.insert()
                    created_nodes.append(upi_node_id)
                    logger.info(f"GraphExpander: Created UPI node {upi_clean}")
                else:
                    new_score = min(100, upi_node.risk_score + 10)
                    upi_node.risk_score = new_score
                    upi_node.is_flagged = True
                    await upi_node.save()

                # Create edge: victim -> UPI (transferred_to)
                await self._upsert_edge(
                    source=victim_node.node_id,
                    target=upi_node.node_id,
                    edge_type=EdgeType.TRANSFERRED_TO,
                    amount=complaint.amount_lost,
                    created_edges=created_edges,
                )

                # If both phone and UPI exist, link them (belongs_to)
                if complaint.phone:
                    phone_clean = self._normalize_phone(complaint.phone)
                    phone_node = await FraudNode.find_one({
                        "$or": [
                            {"node_id": f"phone_auto_{phone_clean}"},
                            {"node_type": "phone", "properties.phone_number": phone_clean},
                        ]
                    })
                    if phone_node:
                        await self._upsert_edge(
                            source=phone_node.node_id,
                            target=upi_node.node_id,
                            edge_type=EdgeType.BELONGS_TO,
                            created_edges=created_edges,
                        )

            summary = {
                "expanded": True,
                "nodes_created": len(created_nodes),
                "edges_created": len(created_edges),
                "new_nodes": created_nodes,
                "new_edges": created_edges,
            }
            logger.info(f"GraphExpander: Expansion complete — {len(created_nodes)} nodes, {len(created_edges)} edges created.")
            return summary

        except Exception as e:
            logger.error(f"GraphExpander: Failed to expand graph — {e}")
            return {"expanded": False, "reason": str(e)}

    async def _upsert_edge(
        self,
        source: str,
        target: str,
        edge_type: EdgeType,
        amount: Optional[float] = None,
        created_edges: list = None,
    ):
        """Create an edge or increment its frequency if it already exists."""
        existing = await FraudEdge.find_one({
            "source_node_id": source,
            "target_node_id": target,
            "edge_type": edge_type.value,
        })

        if existing:
            existing.frequency = (existing.frequency or 0) + 1
            existing.weight = min(1.0, existing.weight + 0.1)
            if amount and amount > 0:
                existing.amount = (existing.amount or 0) + amount
            await existing.save()
            logger.debug(f"GraphExpander: Updated edge {source} -> {target} (freq: {existing.frequency})")
        else:
            edge = FraudEdge(
                source_node_id=source,
                target_node_id=target,
                edge_type=edge_type,
                weight=0.5,
                amount=amount if amount and amount > 0 else None,
                frequency=1,
            )
            await edge.insert()
            if created_edges is not None:
                created_edges.append(f"{source} -> {target}")
            logger.debug(f"GraphExpander: Created edge {source} -> {target}")

    def _normalize_phone(self, phone: str) -> str:
        """Normalize a phone number to +91XXXXXXXXXX format."""
        cleaned = "".join(c for c in phone if c.isdigit())
        if len(cleaned) == 10:
            return f"+91{cleaned}"
        elif len(cleaned) == 12 and cleaned.startswith("91"):
            return f"+{cleaned}"
        elif phone.startswith("+"):
            return f"+{cleaned}"
        return phone


# Global singleton
graph_expander = GraphAutoExpander()
