"""
Rakshak AI - Fraud Network Service

Business logic for fraud network intelligence.
Uses NetworkX for graph algorithms: Louvain, PageRank, Centrality.
"""

import time
from typing import Optional

from app.models.fraud_node import FraudNode
from app.models.fraud_edge import FraudEdge
from app.schemas.fraud_network import (
    NetworkSearchRequest,
    GraphAnalyzeRequest,
    GraphNode,
    GraphEdge,
    NodeMetrics,
    GraphResponse,
    NodeDetailResponse,
    GraphAnalyzeResponse,
    CommunityResponse,
    CommunitiesListResponse,
    RankedNode,
)
from app.middleware.exceptions import NotFoundException
from app.ml.graph_analyzer import graph_analyzer
from loguru import logger


class FraudNetworkService:
    """Fraud network graph analysis and querying."""

    async def get_graph(
        self,
        community_id: Optional[int],
        node_type: Optional[str],
        limit: int,
    ) -> GraphResponse:
        """Get the fraud network graph with optional filters."""
        query = FraudNode.find()

        if community_id is not None:
            query = query.find(FraudNode.community == community_id)
        if node_type:
            query = query.find(FraudNode.node_type == node_type)

        nodes = await query.limit(limit).to_list()
        node_ids = [n.node_id for n in nodes]

        # Get edges between the fetched nodes
        edges = await FraudEdge.find(
            {"$or": [
                {"source_node_id": {"$in": node_ids}},
                {"target_node_id": {"$in": node_ids}},
            ]}
        ).to_list()

        total_nodes = await FraudNode.count()
        total_edges = await FraudEdge.count()

        # Count unique communities
        communities = await FraudNode.distinct("community")
        communities_count = len([c for c in communities if c is not None])

        return GraphResponse(
            nodes=[self._to_graph_node(n) for n in nodes],
            edges=[self._to_graph_edge(e) for e in edges],
            total_nodes=total_nodes,
            total_edges=total_edges,
            communities_count=communities_count,
        )

    async def get_node_detail(self, node_id: str) -> NodeDetailResponse:
        """Get detailed info about a specific node and its connections."""
        node = await FraudNode.find_one(FraudNode.node_id == node_id)
        if not node:
            raise NotFoundException("Fraud node", node_id)

        # Find connected edges
        edges = await FraudEdge.find(
            {"$or": [
                {"source_node_id": node_id},
                {"target_node_id": node_id},
            ]}
        ).to_list()

        # Get connected node IDs
        connected_ids = set()
        for e in edges:
            connected_ids.add(e.source_node_id)
            connected_ids.add(e.target_node_id)
        connected_ids.discard(node_id)

        connected_nodes = await FraudNode.find(
            {"node_id": {"$in": list(connected_ids)}}
        ).to_list()

        return NodeDetailResponse(
            node=self._to_graph_node(node),
            connected_nodes=[self._to_graph_node(n) for n in connected_nodes],
            connected_edges=[self._to_graph_edge(e) for e in edges],
        )

    async def search(self, request: NetworkSearchRequest) -> GraphResponse:
        """Search nodes by query string across properties."""
        query_regex = {"$regex": request.query, "$options": "i"}

        search_filter = {
            "$or": [
                {"label": query_regex},
                {"properties.phone_number": query_regex},
                {"properties.upi_id": query_regex},
                {"properties.bank_account": query_regex},
                {"properties.name": query_regex},
            ]
        }

        if request.node_type:
            search_filter["node_type"] = request.node_type

        nodes = await FraudNode.find(search_filter).limit(request.limit).to_list()
        node_ids = [n.node_id for n in nodes]

        edges = await FraudEdge.find(
            {"$or": [
                {"source_node_id": {"$in": node_ids}},
                {"target_node_id": {"$in": node_ids}},
            ]}
        ).to_list()

        return GraphResponse(
            nodes=[self._to_graph_node(n) for n in nodes],
            edges=[self._to_graph_edge(e) for e in edges],
            total_nodes=len(nodes),
            total_edges=len(edges),
            communities_count=len(set(n.community for n in nodes if n.community is not None)),
        )

    async def run_algorithm(self, request: GraphAnalyzeRequest) -> GraphAnalyzeResponse:
        """Run graph algorithms on the fraud network."""
        start_time = time.time()
        
        # 1. Fetch all graph data
        db_nodes = await FraudNode.find().to_list()
        db_edges = await FraudEdge.find().to_list()
        
        # Convert to dictionary format for analyzer
        nodes_dict = [{"node_id": n.node_id, "node_type": n.node_type.value, "label": n.label, "is_flagged": n.risk_score and n.risk_score >= 50} for n in db_nodes]
        edges_dict = [{"source": e.source_node_id, "target": e.target_node_id, "edge_type": e.edge_type.value, "weight": e.weight} for e in db_edges]
        
        # 2. Build networkx graph
        graph_analyzer.build_graph(nodes_dict, edges_dict)
        
        results = {"algorithm": request.algorithm}
        updated = 0
        
        # 3. Run algorithm and update DB
        if request.algorithm == "louvain":
            res = graph_analyzer.run_louvain()
            communities = res.get("communities", {})
            for node in db_nodes:
                if node.node_id in communities:
                    node.community = communities[node.node_id]
                    await node.save()
                    updated += 1
            results["message"] = f"Detected communities for {updated} nodes."
            
        elif request.algorithm == "pagerank":
            res = graph_analyzer.run_pagerank()
            scores = res.get("scores", {})
            leaders = graph_analyzer.detect_ring_leaders()
            
            for node in db_nodes:
                if node.node_id in scores:
                    node.pagerank = scores[node.node_id]
                    node.is_ring_leader = node.node_id in leaders
                    await node.save()
                    updated += 1
            results["message"] = f"Calculated PageRank. Found {len(leaders)} ring leaders."
            
        elif request.algorithm == "centrality":
            res = graph_analyzer.run_betweenness_centrality()
            scores = res.get("scores", {})
            mules = graph_analyzer.detect_money_mules()
            
            for node in db_nodes:
                if node.node_id in scores:
                    node.degree_centrality = scores[node.node_id]  # using field for centrality
                    node.is_money_mule = node.node_id in mules
                    await node.save()
                    updated += 1
            results["message"] = f"Calculated Centrality. Found {len(mules)} suspected money mules."
        
        else:
            results["message"] = f"Unknown algorithm: {request.algorithm}"

        execution_time_ms = int((time.time() - start_time) * 1000)

        return GraphAnalyzeResponse(
            algorithm=request.algorithm,
            execution_time_ms=execution_time_ms,
            results=results,
            updated_nodes=updated,
        )

    async def get_communities(self) -> CommunitiesListResponse:
        """Get all detected fraud communities/rings."""
        communities = await FraudNode.distinct("community")
        communities = [c for c in communities if c is not None]

        community_list = []
        for cid in communities:
            members = await FraudNode.find(FraudNode.community == cid).to_list()

            leaders = [n for n in members if n.is_ring_leader]
            mules = [n for n in members if n.is_money_mule]

            community_list.append(
                CommunityResponse(
                    community_id=cid,
                    node_count=len(members),
                    total_risk_score=sum(n.risk_score for n in members),
                    ring_leaders=[
                        RankedNode(node_id=n.node_id, label=n.label, score=n.pagerank or 0)
                        for n in leaders
                    ],
                    money_mules=[
                        RankedNode(node_id=n.node_id, label=n.label, score=n.pagerank or 0)
                        for n in mules
                    ],
                    members=[self._to_graph_node(n) for n in members],
                )
            )

        return CommunitiesListResponse(
            communities=community_list,
            total=len(community_list),
        )

    # ─── Helpers ─────────────────────────────────────────────

    def _to_graph_node(self, node: FraudNode) -> GraphNode:
        return GraphNode(
            node_id=node.node_id,
            node_type=node.node_type.value,
            label=node.label,
            properties=node.properties,
            metrics=NodeMetrics(
                pagerank=node.pagerank,
                centrality=node.degree_centrality,
                community_id=node.community,
                is_money_mule=node.is_money_mule,
                is_ring_leader=node.is_ring_leader,
                risk_score=node.risk_score,
            ),
        )

    def _to_graph_edge(self, edge: FraudEdge) -> GraphEdge:
        return GraphEdge(
            source=edge.source_node_id,
            target=edge.target_node_id,
            edge_type=edge.edge_type.value,
            weight=edge.weight,
            properties=edge.properties,
        )
