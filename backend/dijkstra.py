"""
SmartRoute – Dijkstra's Shortest Path Algorithm Implementation
Academic project for Design and Analysis of Algorithms (DAA)

Time Complexity: O((V + E) log V) using Min-Heap / Priority Queue
Space Complexity: O(V + E) for Adjacency List and tracking structures
"""

import heapq
import time
from typing import Dict, List, Optional, Tuple, Any


class PriorityQueue:
    """
    Min-Heap Priority Queue implementation wrapping Python's heapq.
    Stores tuples of (distance, vertex_id).
    """
    def __init__(self):
        self._heap: List[Tuple[float, Any]] = []

    def push(self, item: Any, priority: float):
        heapq.heappush(self._heap, (priority, item))

    def pop(self) -> Tuple[float, Any]:
        return heapq.heappop(self._heap)

    def is_empty(self) -> bool:
        return len(self._heap) == 0


def dijkstra(
    graph: Dict[int, List[Dict[str, Any]]],
    source: int,
    destination: Optional[int] = None
) -> Dict[str, Any]:
    """
    Executes Dijkstra's algorithm on a weighted graph represented as an adjacency list.

    Parameters:
    - graph: Adjacency list mapping node_id -> list of {'node': neighbor_id, 'weight': distance, 'road_name': name}
    - source: ID of source vertex
    - destination: Optional ID of destination vertex

    Returns dictionary with:
    - distance: Shortest distance to destination (or None if unreachable / no destination)
    - path: List of node IDs representing the shortest path from source to destination
    - path_steps: Step-by-step breakdown with road names and segment distances
    - visited_nodes: Order of nodes visited / extracted with minimum distance
    - execution_time_ms: Measured execution time in milliseconds
    - all_distances: Dictionary of shortest distances to all reachable nodes
    - nodes_processed: Number of nodes processed
    - edges_examined: Number of edges relaxed / inspected
    - steps_log: Detailed step-by-step relaxation log for educational visualizers
    """
    start_time = time.perf_counter()

    # Verify source exists in graph
    if source not in graph:
        execution_time = (time.perf_counter() - start_time) * 1000
        return {
            "distance": None,
            "path": [],
            "path_steps": [],
            "visited_nodes": [],
            "execution_time_ms": round(execution_time, 4),
            "all_distances": {},
            "nodes_processed": 0,
            "edges_examined": 0,
            "steps_log": [],
            "error": "Source vertex not found in graph"
        }

    # Special case: source == destination
    if destination is not None and source == destination:
        execution_time = (time.perf_counter() - start_time) * 1000
        return {
            "distance": 0.0,
            "path": [source],
            "path_steps": [{"from": source, "to": source, "distance": 0.0, "road_name": "Origin"}],
            "visited_nodes": [source],
            "execution_time_ms": round(execution_time, 4),
            "all_distances": {str(k): (0.0 if k == source else float('inf')) for k in graph},
            "nodes_processed": 1,
            "edges_examined": 0,
            "steps_log": [f"Source equals destination ({source}). Shortest distance is 0 km."],
        }

    # Step 1: Initialize distances to infinity and source distance to 0
    distances: Dict[int, float] = {node: float('inf') for node in graph}
    distances[source] = 0.0

    # Predecessors map: stores (previous_node, edge_distance, road_name)
    predecessors: Dict[int, Optional[Tuple[int, float, str]]] = {node: None for node in graph}

    # Visited set: nodes whose shortest path is finalized
    visited = set()
    visited_order: List[int] = []

    # Priority queue: min-heap of (distance, node)
    pq = PriorityQueue()
    pq.push(source, 0.0)

    nodes_processed = 0
    edges_examined = 0
    steps_log: List[Dict[str, Any]] = []

    steps_log.append({
        "type": "init",
        "message": f"Initialized source vertex {source} with distance 0. All other {len(graph) - 1} vertices set to infinity.",
        "current_node": source,
        "distances": {str(k): (v if v != float('inf') else None) for k, v in distances.items()}
    })

    while not pq.is_empty():
        current_dist, current_node = pq.pop()

        # If we pulled a stale entry with larger distance than recorded, skip
        if current_dist > distances[current_node]:
            continue

        if current_node in visited:
            continue

        # Mark as visited
        visited.add(current_node)
        visited_order.append(current_node)
        nodes_processed += 1

        steps_log.append({
            "type": "visit",
            "message": f"Extracted vertex {current_node} with minimum tentative distance {current_dist:.2f} km.",
            "current_node": current_node,
            "visited_count": len(visited)
        })

        # Early termination if destination reached
        if destination is not None and current_node == destination:
            break

        # Relax all outgoing edges from current_node
        for edge in graph.get(current_node, []):
            neighbor = edge["node"]
            weight = edge["weight"]
            road_name = edge.get("road_name", "Connected Road")
            edges_examined += 1

            if neighbor not in visited:
                new_distance = current_dist + weight

                # Relaxation step: if new path is shorter
                if new_distance < distances.get(neighbor, float('inf')):
                    old_dist = distances.get(neighbor, float('inf'))
                    distances[neighbor] = new_distance
                    predecessors[neighbor] = (current_node, weight, road_name)
                    pq.push(neighbor, new_distance)

                    steps_log.append({
                        "type": "relax",
                        "message": f"Relaxed edge ({current_node} -> {neighbor}) via '{road_name}': updated distance from {('inf' if old_dist == float('inf') else f'{old_dist:.2f}')} to {new_distance:.2f} km.",
                        "edge": [current_node, neighbor],
                        "weight": weight,
                        "new_distance": new_distance
                    })

    # Step 8: Reconstruct actual shortest path if destination provided
    shortest_path: List[int] = []
    path_steps: List[Dict[str, Any]] = []
    final_distance: Optional[float] = None

    if destination is not None:
        if distances.get(destination, float('inf')) != float('inf'):
            final_distance = round(distances[destination], 2)
            curr = destination
            raw_path = []
            while curr is not None:
                raw_path.append(curr)
                pred_info = predecessors.get(curr)
                if pred_info is None:
                    break
                curr = pred_info[0]

            raw_path.reverse()
            shortest_path = raw_path

            # Build step-by-step route descriptions
            for i in range(len(shortest_path) - 1):
                u = shortest_path[i]
                v = shortest_path[i + 1]
                pred_info = predecessors.get(v)
                seg_dist = pred_info[1] if pred_info else 0.0
                road_name = pred_info[2] if pred_info else "Road"
                path_steps.append({
                    "step": i + 1,
                    "from_node_id": u,
                    "to_node_id": v,
                    "distance": seg_dist,
                    "road_name": road_name
                })
        else:
            final_distance = None
            shortest_path = []

    execution_time_ms = (time.perf_counter() - start_time) * 1000

    # Format all_distances mapping with None for infinite
    formatted_distances = {}
    for node, d in distances.items():
        formatted_distances[str(node)] = None if d == float('inf') else round(d, 2)

    return {
        "distance": final_distance,
        "path": shortest_path,
        "path_steps": path_steps,
        "visited_nodes": visited_order,
        "execution_time_ms": round(max(execution_time_ms, 0.01), 4),
        "all_distances": formatted_distances,
        "nodes_processed": nodes_processed,
        "edges_examined": edges_examined,
        "steps_log": steps_log
    }
