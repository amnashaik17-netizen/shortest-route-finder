"""
Automated Unit Tests for Dijkstra's Shortest Path Algorithm
Tests all 6 academic requirements specified in Project Specification.
"""

import unittest
from dijkstra import dijkstra


class TestDijkstraAlgorithm(unittest.TestCase):

    def test_academic_demo_graph(self):
        """
        Tests the exact academic example from prompt:
        A (1) ----4---- B (2)
        |               |
        2               1
        |               |
        C (3) ----3---- D (4)

        Expected from A (1):
        A -> C = 2
        A -> B = 4
        A -> C -> D = 5
        """
        # Node mapping: A: 1, B: 2, C: 3, D: 4 (undirected edges modeled symmetrically)
        graph = {
            1: [{"node": 2, "weight": 4.0, "road_name": "A-B Link"}, {"node": 3, "weight": 2.0, "road_name": "A-C Link"}],
            2: [{"node": 1, "weight": 4.0, "road_name": "A-B Link"}, {"node": 4, "weight": 1.0, "road_name": "B-D Link"}],
            3: [{"node": 1, "weight": 2.0, "road_name": "A-C Link"}, {"node": 4, "weight": 3.0, "road_name": "C-D Link"}],
            4: [{"node": 2, "weight": 1.0, "road_name": "B-D Link"}, {"node": 3, "weight": 3.0, "road_name": "C-D Link"}]
        }

        # Query A -> C
        res_ac = dijkstra(graph, source=1, destination=3)
        self.assertEqual(res_ac["distance"], 2.0)
        self.assertEqual(res_ac["path"], [1, 3])

        # Query A -> B
        res_ab = dijkstra(graph, source=1, destination=2)
        self.assertEqual(res_ab["distance"], 4.0)
        self.assertEqual(res_ab["path"], [1, 2])

        # Query A -> D (A -> C -> D = 2 + 3 = 5 km)
        res_ad = dijkstra(graph, source=1, destination=4)
        self.assertEqual(res_ad["distance"], 5.0)
        self.assertEqual(res_ad["path"], [1, 3, 4])
        self.assertGreater(res_ad["execution_time_ms"], 0)

    def test_simple_connected_graph(self):
        """1. Simple connected graph with straight path"""
        graph = {
            1: [{"node": 2, "weight": 5.0, "road_name": "Road 1-2"}],
            2: [{"node": 3, "weight": 3.0, "road_name": "Road 2-3"}],
            3: []
        }
        res = dijkstra(graph, source=1, destination=3)
        self.assertEqual(res["distance"], 8.0)
        self.assertEqual(res["path"], [1, 2, 3])
        self.assertEqual(len(res["path_steps"]), 2)

    def test_multiple_possible_paths(self):
        """2. Multiple paths: picking optimal path over a longer direct link"""
        graph = {
            1: [{"node": 2, "weight": 10.0, "road_name": "Slow Highway"},
                {"node": 3, "weight": 2.0, "road_name": "Shortcut A"}],
            2: [],
            3: [{"node": 4, "weight": 3.0, "road_name": "Shortcut B"}],
            4: [{"node": 2, "weight": 1.0, "road_name": "Shortcut C"}]
        }
        # Path 1 -> 3 -> 4 -> 2 has total distance 2 + 3 + 1 = 6 vs direct 10
        res = dijkstra(graph, source=1, destination=2)
        self.assertEqual(res["distance"], 6.0)
        self.assertEqual(res["path"], [1, 3, 4, 2])

    def test_source_equals_destination(self):
        """3. Source == Destination"""
        graph = {
            1: [{"node": 2, "weight": 4.0, "road_name": "Road"}],
            2: []
        }
        res = dijkstra(graph, source=1, destination=1)
        self.assertEqual(res["distance"], 0.0)
        self.assertEqual(res["path"], [1])

    def test_no_route_disconnected_graph(self):
        """4. No route between disconnected components"""
        graph = {
            1: [{"node": 2, "weight": 4.0, "road_name": "Island A"}],
            2: [],
            3: [{"node": 4, "weight": 5.0, "road_name": "Island B"}],
            4: []
        }
        res = dijkstra(graph, source=1, destination=4)
        self.assertIsNone(res["distance"])
        self.assertEqual(res["path"], [])

    def test_large_graph_10_plus_locations(self):
        """5. Larger graph with 10+ realistic locations"""
        graph = {i: [] for i in range(1, 13)}
        edges = [
            (1, 2, 3.5), (1, 3, 5.0), (2, 4, 2.1), (3, 4, 1.8),
            (4, 5, 4.2), (5, 6, 6.0), (3, 7, 7.5), (7, 8, 3.0),
            (8, 9, 2.5), (9, 10, 4.0), (6, 10, 3.2), (10, 11, 2.0),
            (11, 12, 1.5), (5, 12, 8.0)
        ]
        for u, v, w in edges:
            graph[u].append({"node": v, "weight": w, "road_name": f"Road {u}-{v}"})
            graph[v].append({"node": u, "weight": w, "road_name": f"Road {v}-{u}"})

        res = dijkstra(graph, source=1, destination=12)
        self.assertIsNotNone(res["distance"])
        self.assertGreater(len(res["path"]), 1)
        self.assertEqual(res["path"][0], 1)
        self.assertEqual(res["path"][-1], 12)
        self.assertGreaterEqual(res["nodes_processed"], 1)

    def test_different_edge_weights(self):
        """6. Different fractional edge weights"""
        graph = {
            1: [{"node": 2, "weight": 0.4, "road_name": "Short Lane"}],
            2: [{"node": 3, "weight": 1.25, "road_name": "Avenue"}],
            3: []
        }
        res = dijkstra(graph, source=1, destination=3)
        self.assertEqual(res["distance"], 1.65)


if __name__ == "__main__":
    unittest.main()
