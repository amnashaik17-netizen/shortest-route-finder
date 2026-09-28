"""
Data models and graph representation classes for SmartRoute.
Provides graph construction utilities:
- Adjacency List: Space Complexity O(V + E)
- Adjacency Matrix: Space Complexity O(V^2)
"""

from typing import Dict, List, Tuple, Any, Optional


class GraphModel:
    """
    Weighted Graph data structure providing both Adjacency List and Adjacency Matrix representations.
    """
    def __init__(self, locations: List[Dict[str, Any]], roads: List[Dict[str, Any]]):
        self.locations = {loc["id"]: loc for loc in locations}
        self.roads = roads

        # Node index mapping for Matrix representation
        self.node_ids = sorted(list(self.locations.keys()))
        self.node_to_idx = {node_id: idx for idx, node_id in enumerate(self.node_ids)}
        self.idx_to_node = {idx: node_id for idx, node_id in enumerate(self.node_ids)}

        # Build representations
        self.adjacency_list = self._build_adjacency_list()
        self.adjacency_matrix = self._build_adjacency_matrix()

    def _build_adjacency_list(self) -> Dict[int, List[Dict[str, Any]]]:
        adj_list: Dict[int, List[Dict[str, Any]]] = {node_id: [] for node_id in self.locations}
        for road in self.roads:
            u = road["source_location_id"]
            v = road["destination_location_id"]
            weight = float(road["distance"])
            name = road.get("road_name") or f"Road {u}-{v}"
            if u in adj_list and v in self.locations:
                adj_list[u].append({
                    "node": v,
                    "weight": weight,
                    "road_name": name,
                    "road_id": road.get("id")
                })
        return adj_list

    def _build_adjacency_matrix(self) -> List[List[Optional[float]]]:
        n = len(self.node_ids)
        matrix: List[List[Optional[float]]] = [[None for _ in range(n)] for _ in range(n)]
        # Self distance is 0
        for i in range(n):
            matrix[i][i] = 0.0

        for road in self.roads:
            u = road["source_location_id"]
            v = road["destination_location_id"]
            if u in self.node_to_idx and v in self.node_to_idx:
                i = self.node_to_idx[u]
                j = self.node_to_idx[v]
                w = float(road["distance"])
                # If multiple edges between same pair, keep smallest
                if matrix[i][j] is None or w < matrix[i][j]:
                    matrix[i][j] = w

        return matrix

    def to_dict(self) -> Dict[str, Any]:
        return {
            "vertices_count": len(self.locations),
            "edges_count": len(self.roads),
            "locations": list(self.locations.values()),
            "roads": self.roads,
            "adjacency_list": {
                str(k): v for k, v in self.adjacency_list.items()
            },
            "adjacency_matrix": {
                "headers": [self.locations[nid]["name"] for nid in self.node_ids],
                "node_ids": self.node_ids,
                "matrix": self.adjacency_matrix
            },
            "complexity_info": {
                "adjacency_list": {
                    "space_complexity": "O(V + E)",
                    "v": len(self.locations),
                    "e": len(self.roads),
                    "theoretical_units": len(self.locations) + len(self.roads)
                },
                "adjacency_matrix": {
                    "space_complexity": "O(V²)",
                    "v": len(self.locations),
                    "theoretical_units": len(self.locations) ** 2
                }
            }
        }
