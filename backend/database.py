"""
Database management for SmartRoute using SQLite.
Implements locations, roads, and route_history tables with foreign keys and CRUD operations.
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "smartroute.db")


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(seed_if_empty: bool = True):
    """Initializes SQLite tables and seeds sample data if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_location_id INTEGER NOT NULL,
        destination_location_id INTEGER NOT NULL,
        distance REAL NOT NULL CHECK (distance > 0),
        road_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_location_id) REFERENCES locations (id) ON DELETE CASCADE,
        FOREIGN KEY (destination_location_id) REFERENCES locations (id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS route_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_location_id INTEGER NOT NULL,
        destination_location_id INTEGER NOT NULL,
        shortest_distance REAL NOT NULL,
        shortest_path TEXT NOT NULL,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_location_id) REFERENCES locations (id) ON DELETE CASCADE,
        FOREIGN KEY (destination_location_id) REFERENCES locations (id) ON DELETE CASCADE
    );
    """)
    conn.commit()

    if seed_if_empty:
        cursor.execute("SELECT COUNT(*) FROM locations")
        count = cursor.fetchone()[0]
        if count == 0:
            seed_sample_city_data(conn)

    conn.close()


def seed_sample_city_data(conn: Optional[sqlite3.Connection] = None):
    """Seeds at least 10 realistic fictional locations and road connections."""
    close_conn = False
    if conn is None:
        conn = get_db_connection()
        close_conn = True

    cursor = conn.cursor()
    cursor.execute("DELETE FROM route_history;")
    cursor.execute("DELETE FROM roads;")
    cursor.execute("DELETE FROM locations;")

    # 12 realistic fictional locations with geographic coordinates
    sample_locations = [
        ("Central Station", 28.6139, 77.2090, "Main metropolitan transit hub with multi-line rail connectivity"),
        ("City Hospital", 28.6250, 77.2150, "Premier regional healthcare center and trauma unit"),
        ("University", 28.6380, 77.2020, "State university campus with research labs and libraries"),
        ("Main Market", 28.6180, 77.2280, "Historic commercial district with retail stores and markets"),
        ("Airport", 28.5560, 77.0990, "International airport terminal with dedicated highway links"),
        ("Railway Station", 28.6010, 77.2180, "Intercity passenger terminal and logistics depot"),
        ("Tech Park", 28.5850, 77.2350, "High-tech software hub with corporate headquarters"),
        ("Bus Terminal", 28.6300, 77.2400, "Central interstate bus terminal and commuter depot"),
        ("Shopping Mall", 28.5720, 77.2100, "Multi-level retail mall, cinema, and dining complex"),
        ("City Park", 28.6100, 77.1950, "Sprawling botanical gardens and municipal recreation grounds"),
        ("Harbor Bay", 28.6450, 77.2200, "Waterfront recreational area and ferry dock"),
        ("Business District", 28.5950, 77.2250, "Financial district with banking towers and stock exchange")
    ]

    cursor.executemany(
        "INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?);",
        sample_locations
    )
    conn.commit()

    # Get location IDs
    cursor.execute("SELECT id, name FROM locations;")
    loc_map = {row["name"]: row["id"] for row in cursor.fetchall()}

    # Realistic bidirectional roads connecting the network
    sample_roads = [
        ("Central Station", "City Hospital", 3.2, "Grand Trunk Road"),
        ("Central Station", "Railway Station", 1.8, "Station Boulevard"),
        ("Central Station", "City Park", 2.1, "Greenway Avenue"),
        ("City Hospital", "University", 2.5, "College Lane"),
        ("City Hospital", "Main Market", 2.9, "Health Corridor"),
        ("University", "Harbor Bay", 2.0, "North Shore Drive"),
        ("University", "City Park", 3.7, "Academic Link"),
        ("Main Market", "Bus Terminal", 2.2, "Bazaar Way"),
        ("Main Market", "Business District", 3.4, "Commercial Expressway"),
        ("Railway Station", "Shopping Mall", 3.5, "South Central Avenue"),
        ("Railway Station", "Business District", 1.9, "Banker's Row"),
        ("Tech Park", "Business District", 2.3, "Silicon Highway"),
        ("Tech Park", "Airport", 5.8, "Airport Skyway"),
        ("Shopping Mall", "Airport", 4.5, "Southern Bypass"),
        ("Bus Terminal", "Harbor Bay", 2.8, "Waterfront Way"),
        ("Bus Terminal", "Tech Park", 4.1, "East Metro Corridor"),
        ("City Park", "Airport", 6.2, "Ring Road West")
    ]

    for src_name, dst_name, dist, road_name in sample_roads:
        if src_name in loc_map and dst_name in loc_map:
            u = loc_map[src_name]
            v = loc_map[dst_name]
            # Symmetrical bidirectional roads
            cursor.execute(
                "INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?);",
                (u, v, dist, road_name)
            )
            cursor.execute(
                "INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?);",
                (v, u, dist, road_name)
            )

    conn.commit()
    if close_conn:
        conn.close()


def seed_academic_demo_data(conn: Optional[sqlite3.Connection] = None):
    """
    Seeds the exact 4-node academic demonstration graph from Section 2:
    A ----4---- B
    |           |
    2           1
    |           |
    C ----3---- D
    """
    close_conn = False
    if conn is None:
        conn = get_db_connection()
        close_conn = True

    cursor = conn.cursor()
    cursor.execute("DELETE FROM route_history;")
    cursor.execute("DELETE FROM roads;")
    cursor.execute("DELETE FROM locations;")

    academic_nodes = [
        ("Location A", 28.6100, 77.2000, "Academic Demo Node A (Source Example)"),
        ("Location B", 28.6100, 77.2300, "Academic Demo Node B"),
        ("Location C", 28.5800, 77.2000, "Academic Demo Node C"),
        ("Location D", 28.5800, 77.2300, "Academic Demo Node D")
    ]

    cursor.executemany(
        "INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?);",
        academic_nodes
    )
    conn.commit()

    cursor.execute("SELECT id, name FROM locations;")
    loc_map = {row["name"]: row["id"] for row in cursor.fetchall()}

    a = loc_map["Location A"]
    b = loc_map["Location B"]
    c = loc_map["Location C"]
    d = loc_map["Location D"]

    academic_edges = [
        (a, b, 4.0, "Road A-B (4 km)"),
        (b, a, 4.0, "Road A-B (4 km)"),
        (a, c, 2.0, "Road A-C (2 km)"),
        (c, a, 2.0, "Road A-C (2 km)"),
        (b, d, 1.0, "Road B-D (1 km)"),
        (d, b, 1.0, "Road B-D (1 km)"),
        (c, d, 3.0, "Road C-D (3 km)"),
        (d, c, 3.0, "Road C-D (3 km)")
    ]

    cursor.executemany(
        "INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?);",
        academic_edges
    )
    conn.commit()

    if close_conn:
        conn.close()
