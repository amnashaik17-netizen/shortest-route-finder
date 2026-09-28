import express from 'express';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const appDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'smartroute.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

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
`);

// Seeding utilities
function seedCityData() {
  db.exec('DELETE FROM route_history;');
  db.exec('DELETE FROM roads;');
  db.exec('DELETE FROM locations;');

  const insertLoc = db.prepare(
    'INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?)'
  );

  const locations = [
    ['Central Station', 28.6139, 77.2090, 'Main metropolitan transit hub with multi-line rail connectivity'],
    ['City Hospital', 28.6250, 77.2150, 'Premier regional healthcare center and trauma unit'],
    ['University', 28.6380, 77.2020, 'State university campus with research labs and libraries'],
    ['Main Market', 28.6180, 77.2280, 'Historic commercial district with retail stores and markets'],
    ['Airport', 28.5560, 77.0990, 'International airport terminal with dedicated highway links'],
    ['Railway Station', 28.6010, 77.2180, 'Intercity passenger terminal and logistics depot'],
    ['Tech Park', 28.5850, 77.2350, 'High-tech software hub with corporate headquarters'],
    ['Bus Terminal', 28.6300, 77.2400, 'Central interstate bus terminal and commuter depot'],
    ['Shopping Mall', 28.5720, 77.2100, 'Multi-level retail mall, cinema, and dining complex'],
    ['City Park', 28.6100, 77.1950, 'Sprawling botanical gardens and municipal recreation grounds'],
    ['Harbor Bay', 28.6450, 77.2200, 'Waterfront recreational area and ferry dock'],
    ['Business District', 28.5950, 77.2250, 'Financial district with banking towers and stock exchange']
  ];

  for (const loc of locations) {
    insertLoc.run(loc[0], loc[1], loc[2], loc[3]);
  }

  const allLocs = db.prepare('SELECT id, name FROM locations').all() as any[];
  const locMap = new Map<string, number>();
  for (const l of allLocs) {
    locMap.set(l.name, l.id);
  }

  const insertRoad = db.prepare(
    'INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?)'
  );

  const roads = [
    ['Central Station', 'City Hospital', 3.2, 'Grand Trunk Road'],
    ['Central Station', 'Railway Station', 1.8, 'Station Boulevard'],
    ['Central Station', 'City Park', 2.1, 'Greenway Avenue'],
    ['City Hospital', 'University', 2.5, 'College Lane'],
    ['City Hospital', 'Main Market', 2.9, 'Health Corridor'],
    ['University', 'Harbor Bay', 2.0, 'North Shore Drive'],
    ['University', 'City Park', 3.7, 'Academic Link'],
    ['Main Market', 'Bus Terminal', 2.2, 'Bazaar Way'],
    ['Main Market', 'Business District', 3.4, 'Commercial Expressway'],
    ['Railway Station', 'Shopping Mall', 3.5, 'South Central Avenue'],
    ['Railway Station', 'Business District', 1.9, "Banker's Row"],
    ['Tech Park', 'Business District', 2.3, 'Silicon Highway'],
    ['Tech Park', 'Airport', 5.8, 'Airport Skyway'],
    ['Shopping Mall', 'Airport', 4.5, 'Southern Bypass'],
    ['Bus Terminal', 'Harbor Bay', 2.8, 'Waterfront Way'],
    ['Bus Terminal', 'Tech Park', 4.1, 'East Metro Corridor'],
    ['City Park', 'Airport', 6.2, 'Ring Road West']
  ];

  for (const r of roads) {
    const u = locMap.get(r[0] as string);
    const v = locMap.get(r[1] as string);
    if (u && v) {
      insertRoad.run(u, v, r[2], r[3]);
      insertRoad.run(v, u, r[2], r[3]);
    }
  }
}

function seedAcademicDemo() {
  db.exec('DELETE FROM route_history;');
  db.exec('DELETE FROM roads;');
  db.exec('DELETE FROM locations;');

  const insertLoc = db.prepare(
    'INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?)'
  );

  insertLoc.run('Location A', 28.6100, 77.2000, 'Academic Demo Node A (Source Example)');
  insertLoc.run('Location B', 28.6100, 77.2300, 'Academic Demo Node B');
  insertLoc.run('Location C', 28.5800, 77.2000, 'Academic Demo Node C');
  insertLoc.run('Location D', 28.5800, 77.2300, 'Academic Demo Node D');

  const allLocs = db.prepare('SELECT id, name FROM locations').all() as any[];
  const locMap = new Map<string, number>();
  for (const l of allLocs) {
    locMap.set(l.name, l.id);
  }

  const a = locMap.get('Location A')!;
  const b = locMap.get('Location B')!;
  const c = locMap.get('Location C')!;
  const d = locMap.get('Location D')!;

  const insertRoad = db.prepare(
    'INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?)'
  );

  const academicEdges = [
    [a, b, 4.0, 'Road A-B (4 km)'],
    [b, a, 4.0, 'Road A-B (4 km)'],
    [a, c, 2.0, 'Road A-C (2 km)'],
    [c, a, 2.0, 'Road A-C (2 km)'],
    [b, d, 1.0, 'Road B-D (1 km)'],
    [d, b, 1.0, 'Road B-D (1 km)'],
    [c, d, 3.0, 'Road C-D (3 km)'],
    [d, c, 3.0, 'Road C-D (3 km)']
  ];

  for (const edge of academicEdges) {
    insertRoad.run(edge[0], edge[1], edge[2], edge[3]);
  }
}

// Check if seeding needed
const countCheck = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
if (countCheck.count === 0) {
  seedCityData();
}

// -------------------------------------------------------------
// Priority Queue / Min-Heap implementation for Dijkstra
// Time Complexity: O((V + E) log V)
// -------------------------------------------------------------
class MinHeap<T> {
  private heap: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): { item: T; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].priority < this.heap[parent].priority) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[parent];
        this.heap[parent] = temp;
        index = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest !== index) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[smallest];
        this.heap[smallest] = temp;
        index = smallest;
      } else {
        break;
      }
    }
  }
}

// Dijkstra Algorithm from scratch
function runDijkstra(
  adjList: Map<number, { node: number; weight: number; road_name: string }[]>,
  source: number,
  destination: number | null
) {
  const startTime = performance.now();

  const distances = new Map<number, number>();
  const predecessors = new Map<number, { from: number; distance: number; road_name: string } | null>();
  const visited = new Set<number>();
  const visitedOrder: number[] = [];
  const stepsLog: any[] = [];

  let nodesProcessed = 0;
  let edgesExamined = 0;

  for (const node of adjList.keys()) {
    distances.set(node, Infinity);
    predecessors.set(node, null);
  }

  distances.set(source, 0);

  const pq = new MinHeap<number>();
  pq.push(source, 0);

  stepsLog.push({
    type: 'init',
    message: `Initialized source vertex ${source} with distance 0 km. Set all other ${adjList.size - 1} vertices to infinity.`,
    current_node: source
  });

  if (destination !== null && source === destination) {
    const execTime = performance.now() - startTime;
    return {
      distance: 0,
      path: [source],
      path_steps: [{ step: 1, from_node_id: source, to_node_id: source, distance: 0, road_name: 'Origin' }],
      visited_nodes: [source],
      execution_time_ms: Number(execTime.toFixed(4)),
      all_distances: { [source]: 0 },
      nodes_processed: 1,
      edges_examined: 0,
      steps_log: [{ type: 'visit', message: 'Source equals destination. Distance is 0 km.' }]
    };
  }

  while (!pq.isEmpty()) {
    const extracted = pq.pop()!;
    const u = extracted.item;
    const d = extracted.priority;

    if (d > (distances.get(u) ?? Infinity)) continue;
    if (visited.has(u)) continue;

    visited.add(u);
    visitedOrder.push(u);
    nodesProcessed++;

    stepsLog.push({
      type: 'visit',
      message: `Extracted vertex ${u} with minimum tentative distance ${d.toFixed(2)} km.`,
      current_node: u,
      visited_count: visited.size
    });

    if (destination !== null && u === destination) {
      break;
    }

    const neighbors = adjList.get(u) || [];
    for (const edge of neighbors) {
      edgesExamined++;
      const v = edge.node;
      const weight = edge.weight;
      const roadName = edge.road_name;

      if (!visited.has(v)) {
        const alt = (distances.get(u) ?? Infinity) + weight;
        const currentVDist = distances.get(v) ?? Infinity;

        if (alt < currentVDist) {
          distances.set(v, alt);
          predecessors.set(v, { from: u, distance: weight, road_name: roadName });
          pq.push(v, alt);

          stepsLog.push({
            type: 'relax',
            message: `Relaxed edge (${u} → ${v}) via '${roadName}': decreased distance from ${currentVDist === Infinity ? '∞' : currentVDist.toFixed(2) + ' km'} to ${alt.toFixed(2)} km.`,
            edge: [u, v],
            weight,
            new_distance: alt
          });
        }
      }
    }
  }

  let shortestPath: number[] = [];
  const pathSteps: any[] = [];
  let finalDistance: number | null = null;

  if (destination !== null) {
    const destDist = distances.get(destination);
    if (destDist !== undefined && destDist !== Infinity) {
      finalDistance = Number(destDist.toFixed(2));
      let curr: number | null = destination;
      const reversedPath: number[] = [];

      while (curr !== null) {
        reversedPath.push(curr);
        const pred = predecessors.get(curr);
        if (!pred) break;
        curr = pred.from;
      }

      shortestPath = reversedPath.reverse();

      for (let i = 0; i < shortestPath.length - 1; i++) {
        const u = shortestPath[i];
        const v = shortestPath[i + 1];
        const pred = predecessors.get(v);
        pathSteps.push({
          step: i + 1,
          from_node_id: u,
          to_node_id: v,
          distance: pred?.distance ?? 0,
          road_name: pred?.road_name ?? 'Road'
        });
      }
    }
  }

  const execTime = performance.now() - startTime;

  const allDistances: Record<string, number | null> = {};
  for (const [k, v] of distances.entries()) {
    allDistances[k.toString()] = v === Infinity ? null : Number(v.toFixed(2));
  }

  return {
    distance: finalDistance,
    path: shortestPath,
    path_steps: pathSteps,
    visited_nodes: visitedOrder,
    execution_time_ms: Number(Math.max(execTime, 0.01).toFixed(4)),
    all_distances: allDistances,
    nodes_processed: nodesProcessed,
    edges_examined: edgesExamined,
    steps_log: stepsLog
  };
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SmartRoute', timestamp: new Date().toISOString() });
});

// Statistics
app.get('/api/statistics', (req, res) => {
  const locCount = (db.prepare('SELECT COUNT(*) as count FROM locations').get() as any).count;
  const roadCount = (db.prepare('SELECT COUNT(*) as count FROM roads').get() as any).count;
  const historyCount = (db.prepare('SELECT COUNT(*) as count FROM route_history').get() as any).count;
  const avgDist = (db.prepare('SELECT AVG(shortest_distance) as avg_dist FROM route_history WHERE shortest_distance > 0').get() as any).avg_dist;

  res.json({
    total_locations: locCount,
    total_roads: roadCount,
    routes_calculated: historyCount,
    average_route_distance: avgDist ? Number(avgDist.toFixed(2)) : 0
  });
});

// Locations CRUD
app.get('/api/locations', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY name ASC').all();
  res.json(locations);
});

app.post('/api/locations', (req, res) => {
  const { name, latitude, longitude, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Location name is required' });
  }
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Latitude and Longitude must be valid numbers' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO locations (name, latitude, longitude, description) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name.trim(), lat, lon, description ? description.trim() : '');
    const newId = (result as any).lastInsertRowid;
    const created = db.prepare('SELECT * FROM locations WHERE id = ?').get(newId);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create location' });
  }
});

app.put('/api/locations/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, latitude, longitude, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Location name is required' });
  }
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Latitude and Longitude must be valid numbers' });
  }

  try {
    db.prepare(
      'UPDATE locations SET name = ?, latitude = ?, longitude = ?, description = ? WHERE id = ?'
    ).run(name.trim(), lat, lon, description ? description.trim() : '', id);
    const updated = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update location' });
  }
});

app.delete('/api/locations/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    res.json({ message: `Location ${id} deleted successfully` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete location' });
  }
});

// Roads CRUD
app.get('/api/roads', (req, res) => {
  const roads = db.prepare(`
    SELECT r.*, s.name as source_name, d.name as destination_name
    FROM roads r
    JOIN locations s ON r.source_location_id = s.id
    JOIN locations d ON r.destination_location_id = d.id
    ORDER BY r.id DESC
  `).all();
  res.json(roads);
});

app.post('/api/roads', (req, res) => {
  const { source_location_id, destination_location_id, distance, road_name, bidirectional = true } = req.body;
  const srcId = parseInt(source_location_id, 10);
  const dstId = parseInt(destination_location_id, 10);
  const dist = parseFloat(distance);

  if (isNaN(srcId) || isNaN(dstId)) {
    return res.status(400).json({ error: 'Source and Destination locations are required' });
  }
  if (srcId === dstId) {
    return res.status(400).json({ error: 'Source and destination cannot be identical' });
  }
  if (isNaN(dist) || dist <= 0) {
    return res.status(400).json({ error: 'Distance must be a positive number greater than 0' });
  }

  const name = road_name && road_name.trim() ? road_name.trim() : `Road ${srcId}-${dstId}`;

  try {
    const insertStmt = db.prepare(
      'INSERT INTO roads (source_location_id, destination_location_id, distance, road_name) VALUES (?, ?, ?, ?)'
    );
    const result = insertStmt.run(srcId, dstId, dist, name);
    const newRoadId = (result as any).lastInsertRowid;

    if (bidirectional) {
      insertStmt.run(dstId, srcId, dist, name);
    }

    const created = db.prepare(`
      SELECT r.*, s.name as source_name, d.name as destination_name
      FROM roads r
      JOIN locations s ON r.source_location_id = s.id
      JOIN locations d ON r.destination_location_id = d.id
      WHERE r.id = ?
    `).get(newRoadId);

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create road' });
  }
});

app.put('/api/roads/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { source_location_id, destination_location_id, distance, road_name } = req.body;
  const srcId = parseInt(source_location_id, 10);
  const dstId = parseInt(destination_location_id, 10);
  const dist = parseFloat(distance);

  if (isNaN(srcId) || isNaN(dstId)) {
    return res.status(400).json({ error: 'Source and Destination locations are required' });
  }
  if (srcId === dstId) {
    return res.status(400).json({ error: 'Source and destination cannot be identical' });
  }
  if (isNaN(dist) || dist <= 0) {
    return res.status(400).json({ error: 'Distance must be greater than 0' });
  }

  const name = road_name && road_name.trim() ? road_name.trim() : `Road ${srcId}-${dstId}`;

  try {
    db.prepare(
      'UPDATE roads SET source_location_id = ?, destination_location_id = ?, distance = ?, road_name = ? WHERE id = ?'
    ).run(srcId, dstId, dist, name, id);

    const updated = db.prepare(`
      SELECT r.*, s.name as source_name, d.name as destination_name
      FROM roads r
      JOIN locations s ON r.source_location_id = s.id
      JOIN locations d ON r.destination_location_id = d.id
      WHERE r.id = ?
    `).get(id);

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update road' });
  }
});

app.delete('/api/roads/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    db.prepare('DELETE FROM roads WHERE id = ?').run(id);
    res.json({ message: `Road ${id} deleted successfully` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete road' });
  }
});

// Graph Representation (Adjacency List + Adjacency Matrix)
app.get('/api/graph', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY name ASC').all() as any[];
  const roads = db.prepare(`
    SELECT r.*, s.name as source_name, d.name as destination_name
    FROM roads r
    JOIN locations s ON r.source_location_id = s.id
    JOIN locations d ON r.destination_location_id = d.id
    ORDER BY r.id ASC
  `).all() as any[];

  const adjList: Record<string, any[]> = {};
  for (const loc of locations) {
    adjList[loc.id.toString()] = [];
  }

  for (const r of roads) {
    if (adjList[r.source_location_id.toString()]) {
      adjList[r.source_location_id.toString()].push({
        node: r.destination_location_id,
        weight: Number(r.distance),
        road_name: r.road_name,
        road_id: r.id
      });
    }
  }

  // Build Adjacency Matrix
  const sortedIds = locations.map(l => l.id);
  const idToIndex = new Map<number, number>();
  sortedIds.forEach((id, idx) => idToIndex.set(id, idx));

  const n = sortedIds.length;
  const matrix: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0;
  }

  for (const r of roads) {
    const i = idToIndex.get(r.source_location_id);
    const j = idToIndex.get(r.destination_location_id);
    if (i !== undefined && j !== undefined) {
      const w = Number(r.distance);
      if (matrix[i][j] === null || w < matrix[i][j]!) {
        matrix[i][j] = w;
      }
    }
  }

  res.json({
    vertices_count: locations.length,
    edges_count: roads.length,
    locations,
    roads,
    adjacency_list: adjList,
    adjacency_matrix: {
      headers: locations.map(l => l.name),
      node_ids: sortedIds,
      matrix
    },
    complexity_info: {
      adjacency_list: {
        space_complexity: 'O(V + E)',
        v: locations.length,
        e: roads.length,
        theoretical_units: locations.length + roads.length
      },
      adjacency_matrix: {
        space_complexity: 'O(V²)',
        v: locations.length,
        theoretical_units: Math.pow(locations.length, 2)
      }
    }
  });
});

// Calculate Shortest Path using Dijkstra's Algorithm
app.post('/api/shortest-path', (req, res) => {
  const sourceRaw = req.body.source_location_id ?? req.body.source_id;
  const destRaw = req.body.destination_location_id ?? req.body.destination_id;
  const srcId = parseInt(sourceRaw, 10);
  const dstId = parseInt(destRaw, 10);

  if (isNaN(srcId) || isNaN(dstId)) {
    return res.status(400).json({ error: 'Valid source and destination IDs are required' });
  }

  const locations = db.prepare('SELECT * FROM locations').all() as any[];
  const locMap = new Map<number, any>();
  for (const loc of locations) {
    locMap.set(loc.id, loc);
  }

  const srcLoc = locMap.get(srcId);
  const dstLoc = locMap.get(dstId);

  if (!srcLoc) {
    return res.status(404).json({ error: `Source location ID ${srcId} not found` });
  }
  if (!dstLoc) {
    return res.status(404).json({ error: `Destination location ID ${dstId} not found` });
  }

  const roads = db.prepare('SELECT * FROM roads').all() as any[];

  // Build Adjacency Map
  const adjMap = new Map<number, { node: number; weight: number; road_name: string }[]>();
  for (const loc of locations) {
    adjMap.set(loc.id, []);
  }

  for (const r of roads) {
    if (adjMap.has(r.source_location_id)) {
      adjMap.get(r.source_location_id)!.push({
        node: r.destination_location_id,
        weight: Number(r.distance),
        road_name: r.road_name || `Road ${r.source_location_id}-${r.destination_location_id}`
      });
    }
  }

  const result = runDijkstra(adjMap, srcId, dstId);

  const pathLocations = result.path.map(id => locMap.get(id)).filter(Boolean);

  // Augment path steps with location names
  const augmentedSteps = result.path_steps.map((st: any) => ({
    ...st,
    from_name: locMap.get(st.from_node_id)?.name || `Node ${st.from_node_id}`,
    to_name: locMap.get(st.to_node_id)?.name || `Node ${st.to_node_id}`
  }));

  let historyId: number | undefined;

  // Store in route_history table if valid route found
  if (result.distance !== null) {
    const pathStr = pathLocations.map(l => l.name).join(' → ');
    const historyStmt = db.prepare(
      'INSERT INTO route_history (source_location_id, destination_location_id, shortest_distance, shortest_path) VALUES (?, ?, ?, ?)'
    );
    const historyRes = historyStmt.run(srcId, dstId, result.distance, pathStr);
    historyId = (historyRes as any).lastInsertRowid;
  }

  res.json({
    ...result,
    path_steps: augmentedSteps,
    path_locations: pathLocations,
    source: srcLoc,
    destination: dstLoc,
    vertices_count: locations.length,
    edges_count: roads.length,
    history_id: historyId
  });
});

// Route History
app.get('/api/route-history', (req, res) => {
  const history = db.prepare(`
    SELECT h.*, s.name as source_name, d.name as destination_name
    FROM route_history h
    JOIN locations s ON h.source_location_id = s.id
    JOIN locations d ON h.destination_location_id = d.id
    ORDER BY h.calculated_at DESC
  `).all();
  res.json(history);
});

app.delete('/api/route-history/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    db.prepare('DELETE FROM route_history WHERE id = ?').run(id);
    res.json({ message: `History item ${id} deleted` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/route-history', (req, res) => {
  try {
    db.prepare('DELETE FROM route_history').run();
    res.json({ message: 'All route history cleared' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

function clearAllData() {
  db.exec('DELETE FROM route_history;');
  db.exec('DELETE FROM roads;');
  db.exec('DELETE FROM locations;');
  try {
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('locations', 'roads', 'route_history');");
  } catch (_) {}
}

// Demo Data Reset Endpoints
app.post('/api/demo-data/reset-city', (req, res) => {
  seedCityData();
  res.json({ message: 'Loaded 12-location metropolitan road network sample data successfully' });
});

app.post('/api/demo-data/reset-academic', (req, res) => {
  seedAcademicDemo();
  res.json({ message: 'Loaded 4-node academic demonstration graph (A-B-C-D) successfully' });
});

app.post('/api/demo-data/clear', (req, res) => {
  clearAllData();
  res.json({ message: 'All locations, roads, and history cleared. Ready for custom real-time inputs.' });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartRoute server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
