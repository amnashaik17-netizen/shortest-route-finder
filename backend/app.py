"""
SmartRoute – Python REST API Backend
Provides endpoints for Graph management, SQLite persistence, and Dijkstra calculation.
Can be executed directly: `python backend/app.py`
"""

import json
import os
import sys
from typing import Dict, Any

from database import init_db, get_db_connection, seed_sample_city_data, seed_academic_demo_data
from dijkstra import dijkstra
from models import GraphModel

# Initialize database on startup
init_db(seed_if_empty=True)


def get_graph_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM locations ORDER BY name ASC")
    locations = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
        SELECT r.*, s.name as source_name, d.name as destination_name 
        FROM roads r
        JOIN locations s ON r.source_location_id = s.id
        JOIN locations d ON r.destination_location_id = d.id
        ORDER BY r.id ASC
    """)
    roads = [dict(row) for row in cursor.fetchall()]
    conn.close()

    model = GraphModel(locations, roads)
    return model, locations, roads


# Try importing Flask; if not available, provide standalone WSGI / http.server runner
try:
    from flask import Flask, request, jsonify

    app = Flask(__name__)

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "app": "SmartRoute", "backend": "Python Flask + SQLite"})

    @app.route("/api/statistics", methods=["GET"])
    def get_statistics():
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM locations")
        total_locations = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM roads")
        total_roads = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM route_history")
        total_routes_calculated = c.fetchone()[0]
        c.execute("SELECT AVG(shortest_distance) FROM route_history WHERE shortest_distance > 0")
        avg_dist = c.fetchone()[0]
        conn.close()
        return jsonify({
            "total_locations": total_locations,
            "total_roads": total_roads,
            "routes_calculated": total_routes_calculated,
            "average_route_distance": round(avg_dist, 2) if avg_dist is not None else 0.0
        })

    @app.route("/api/locations", methods=["GET"])
    def list_locations():
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM locations ORDER BY name ASC")
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return jsonify(rows)

    @app.route("/api/locations", methods=["POST"])
    def create_location():
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        try:
            lat = float(data.get("latitude"))
            lon = float(data.get("longitude"))
        except (TypeError, ValueError):
            return jsonify({"error": "Latitude and longitude must be valid floating numbers"}), 400

        if not name:
            return jsonify({"error": "Location name is required"}), 400

        description = data.get("description", "").strip()

        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?)",
                (name, lat, lon, description)
            )
            conn.commit()
            loc_id = c.lastrowid
            c.execute("SELECT * FROM locations WHERE id = ?", (loc_id,))
            new_loc = dict(c.fetchone())
            conn.close()
            return jsonify(new_loc), 201
        except Exception as e:
            conn.close()
            return jsonify({"error": f"Failed to create location: {str(e)}"}), 400

    @app.route("/api/locations/<int:loc_id>", methods=["PUT"])
    def update_location(loc_id):
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        try:
            lat = float(data.get("latitude"))
            lon = float(data.get("longitude"))
        except (TypeError, ValueError):
            return jsonify({"error": "Latitude and longitude must be valid floating numbers"}), 400

        if not name:
            return jsonify({"error": "Location name is required"}), 400

        description = data.get("description", "").strip()

        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "UPDATE locations SET name = ?, latitude = ?, longitude = ?, description = ? WHERE id = ?",
                (name, lat, lon, description, loc_id)
            )
            conn.commit()
            c.execute("SELECT * FROM locations WHERE id = ?", (loc_id,))
            updated_loc = dict(c.fetchone())
            conn.close()
            return jsonify(updated_loc)
        except Exception as e:
            conn.close()
            return jsonify({"error": f"Failed to update location: {str(e)}"}), 400

    @app.route("/api/locations/<int:loc_id>", methods=["DELETE"])
    def delete_location(loc_id):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM locations WHERE id = ?", (loc_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"Location {loc_id} deleted successfully"})

    @app.route("/api/roads", methods=["GET"])
    def list_roads():
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            SELECT r.*, s.name as source_name, d.name as destination_name 
            FROM roads r
            JOIN locations s ON r.source_location_id = s.id
            JOIN locations d ON r.destination_location_id = d.id
            ORDER BY r.id DESC
        """)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return jsonify(rows)

    @app.route("/api/roads", methods=["POST"])
    def create_road():
        data = request.get_json() or {}
        try:
            src_id = int(data.get("source_location_id"))
            dst_id = int(data.get("destination_location_id"))
            distance = float(data.get("distance"))
        except (TypeError, ValueError):
            return jsonify({"error": "Source, destination, and distance are required and must be valid"}), 400

        if src_id == dst_id:
            return jsonify({"error": "Source and destination cannot be identical"}), 400

        if distance <= 0:
            return jsonify({"error": "Distance must be greater than 0"}), 400

        road_name = data.get("road_name", "").strip() or f"Road {src_id}-{dst_id}"
        bidirectional = bool(data.get("bidirectional", True))

        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?)",
                (src_id, dst_id, distance, road_name)
            )
            road_id = c.lastrowid
            if bidirectional:
                c.execute(
                    "INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?)",
                    (dst_id, src_id, distance, road_name)
                )
            conn.commit()
            c.execute("""
                SELECT r.*, s.name as source_name, d.name as destination_name 
                FROM roads r
                JOIN locations s ON r.source_location_id = s.id
                JOIN locations d ON r.destination_location_id = d.id
                WHERE r.id = ?
            """, (road_id,))
            new_road = dict(c.fetchone())
            conn.close()
            return jsonify(new_road), 201
        except Exception as e:
            conn.close()
            return jsonify({"error": f"Failed to create road: {str(e)}"}), 400

    @app.route("/api/roads/<int:road_id>", methods=["PUT"])
    def update_road(road_id):
        data = request.get_json() or {}
        try:
            src_id = int(data.get("source_location_id"))
            dst_id = int(data.get("destination_location_id"))
            distance = float(data.get("distance"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid road fields"}), 400

        if src_id == dst_id:
            return jsonify({"error": "Source and destination cannot be identical"}), 400
        if distance <= 0:
            return jsonify({"error": "Distance must be greater than 0"}), 400

        road_name = data.get("road_name", "").strip() or f"Road {src_id}-{dst_id}"

        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "UPDATE roads SET source_location_id = ?, destination_location_id = ?, distance = ?, road_name = ? WHERE id = ?",
                (src_id, dst_id, distance, road_name, road_id)
            )
            conn.commit()
            c.execute("""
                SELECT r.*, s.name as source_name, d.name as destination_name 
                FROM roads r
                JOIN locations s ON r.source_location_id = s.id
                JOIN locations d ON r.destination_location_id = d.id
                WHERE r.id = ?
            """, (road_id,))
            updated_road = dict(c.fetchone())
            conn.close()
            return jsonify(updated_road)
        except Exception as e:
            conn.close()
            return jsonify({"error": f"Failed to update road: {str(e)}"}), 400

    @app.route("/api/roads/<int:road_id>", methods=["DELETE"])
    def delete_road(road_id):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM roads WHERE id = ?", (road_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"Road {road_id} deleted successfully"})

    @app.route("/api/graph", methods=["GET"])
    def get_graph():
        model, _, _ = get_graph_data()
        return jsonify(model.to_dict())

    @app.route("/api/shortest-path", methods=["POST"])
    def calculate_shortest_path():
        data = request.get_json() or {}
        try:
            src_id = int(data.get("source_location_id"))
            dst_id = int(data.get("destination_location_id"))
        except (TypeError, ValueError):
            return jsonify({"error": "source_location_id and destination_location_id are required"}), 400

        model, locations_list, roads_list = get_graph_data()
        loc_map = {l["id"]: l for l in locations_list}

        if src_id not in loc_map:
            return jsonify({"error": f"Source location {src_id} does not exist"}), 404
        if dst_id not in loc_map:
            return jsonify({"error": f"Destination location {dst_id} does not exist"}), 404

        result = dijkstra(model.adjacency_list, source=src_id, destination=dst_id)

        # Enhance path with location objects
        path_locations = [loc_map[nid] for nid in result["path"] if nid in loc_map]
        result["path_locations"] = path_locations
        result["source"] = loc_map[src_id]
        result["destination"] = loc_map[dst_id]
        result["vertices_count"] = len(locations_list)
        result["edges_count"] = len(roads_list)

        # Save to route history if path found
        if result["distance"] is not None:
            path_str = " → ".join([l["name"] for l in path_locations])
            conn = get_db_connection()
            c = conn.cursor()
            c.execute(
                "INSERT INTO route_history (source_location_id, destination_location_id, shortest_distance, shortest_path) VALUES (?, ?, ?, ?)",
                (src_id, dst_id, result["distance"], path_str)
            )
            conn.commit()
            history_id = c.lastrowid
            result["history_id"] = history_id
            conn.close()

        return jsonify(result)

    @app.route("/api/route-history", methods=["GET"])
    def get_route_history():
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("""
            SELECT h.*, s.name as source_name, d.name as destination_name
            FROM route_history h
            JOIN locations s ON h.source_location_id = s.id
            JOIN locations d ON h.destination_location_id = d.id
            ORDER BY h.calculated_at DESC
        """)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return jsonify(rows)

    @app.route("/api/route-history/<int:hid>", methods=["DELETE"])
    def delete_history_item(hid):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM route_history WHERE id = ?", (hid,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"History item {hid} deleted"})

    @app.route("/api/route-history", methods=["DELETE"])
    def clear_route_history():
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM route_history")
        conn.commit()
        conn.close()
        return jsonify({"message": "All route history cleared"})

    @app.route("/api/demo-data/reset-city", methods=["POST"])
    def reset_city():
        seed_sample_city_data()
        return jsonify({"message": "City demo data loaded successfully with 12 locations and connected roads"})

    @app.route("/api/demo-data/reset-academic", methods=["POST"])
    def reset_academic():
        seed_academic_demo_data()
        return jsonify({"message": "Academic 4-node demo graph loaded successfully"})

except ImportError:
    app = None


if __name__ == "__main__":
    if app is not None:
        port = int(os.environ.get("FLASK_PORT", 5000))
        print(f"Starting Flask server on port {port}...")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print("Flask not installed. To run Flask backend: pip install Flask && python backend/app.py")
