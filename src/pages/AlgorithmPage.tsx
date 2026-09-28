import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Milestone
} from 'lucide-react';

export const AlgorithmPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const vivaQuestions = [
    {
      q: "1. What is Dijkstra's Algorithm and who invented it?",
      a: "Dijkstra's algorithm was published by Dutch computer scientist Edsger W. Dijkstra in 1959. It is a greedy graph search algorithm that solves the Single-Source Shortest Path (SSSP) problem on a weighted, directed or undirected graph with non-negative edge weights."
    },
    {
      q: "2. Why does Dijkstra's Algorithm fail on graphs with negative edge weights?",
      a: "Dijkstra's algorithm is greedy: once a vertex is marked as visited (finalized), it is never reconsidered because the algorithm assumes that all subsequent paths will be strictly longer (non-negative addition). If a negative edge exists later in the graph, it can reduce the path cost after the node has already been marked finalized, violating correctness. For negative weights, the Bellman-Ford algorithm O(V·E) is used instead."
    },
    {
      q: "3. What is the Edge Relaxation process?",
      a: "Relaxation checks whether going through vertex u offers a shorter path to neighbor vertex v than the current known distance dist[v]. Formula: if dist[u] + weight(u, v) < dist[v], then dist[v] = dist[u] + weight(u, v) and parent[v] = u."
    },
    {
      q: "4. What is the Time Complexity using an Adjacency Matrix vs. Min-Heap?",
      a: "Using an Adjacency Matrix and linear search for the minimum vertex takes O(V² + E) = O(V²). Using an Adjacency List with a Binary Min-Heap priority queue reduces the time complexity to O((V + E) log V). Using a Fibonacci Heap can theoretically achieve O(E + V log V)."
    },
    {
      q: "5. What is the Space Complexity of Dijkstra's Algorithm?",
      a: "The space complexity is O(V + E) when using an Adjacency List, arrays for distance dist[V] and parent pointers parent[V], plus the Priority Queue storing up to V vertices."
    },
    {
      q: "6. Can Dijkstra's algorithm work on undirected graphs?",
      a: "Yes! An undirected edge between u and v with weight w is mathematically equivalent to two directed edges: u → v (weight w) and v → u (weight w). As long as all weights are non-negative (w ≥ 0), Dijkstra works identically."
    },
    {
      q: "7. How is the actual shortest path reconstructed after Dijkstra finishes?",
      a: "During relaxation, whenever dist[v] is updated via u, we set parent[v] = u. Once Dijkstra terminates at destination t, we backtrack: t ← parent[t] ← parent[parent[t]] ... until we reach source s, and then reverse this sequence."
    },
    {
      q: "8. How is Dijkstra applied in real GPS navigation systems?",
      a: "GPS navigation systems model road networks as weighted graphs where road intersections are vertices (V), road segments are edges (E), and edge weights represent travel distance, expected travel time (distance / speed limit), or real-time traffic congestion. Modern GPS engines use bidirectional Dijkstra or A* search (Dijkstra + Euclidean distance heuristic) to query large continental road graphs in milliseconds."
    },
    {
      q: "9. What is the difference between Dijkstra and Prim's MST algorithm?",
      a: "Both algorithms use a greedy approach and a priority queue. However, Prim's algorithm minimizes the total edge weight needed to connect all vertices (Minimum Spanning Tree), keying on weight(u, v). Dijkstra's algorithm minimizes the cumulative path distance from a single source to all vertices, keying on dist[u] + weight(u, v)."
    },
    {
      q: "10. What is the difference between Dijkstra and A* Search?",
      a: "A* is an extension of Dijkstra that introduces a heuristic function h(v) estimating the remaining cost from node v to the goal. While Dijkstra explores uniformly in all directions (h(v) = 0), A* directs the search toward the destination using priority f(v) = g(v) + h(v), significantly reducing the number of vertices expanded."
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            DAA Academic Study Guide
          </span>
          <span className="text-xs text-slate-400">Design & Analysis of Algorithms</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Dijkstra's Shortest Path Algorithm
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Comprehensive algorithmic documentation, line-by-line pseudocode, worked academic numerical trace, and college viva examination guide.
        </p>
      </div>

      {/* 1. What is Dijkstra's Algorithm & Concept */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <span>Core Concept & Single Source Shortest Path (SSSP)</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Dijkstra's algorithm is an optimal, greedy graph search algorithm developed by Edsger Dijkstra in 1959. Given a graph <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">G = (V, E)</code> with non-negative edge weights <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">w(u, v) ≥ 0</code> and a designated source vertex <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">s ∈ V</code>, the algorithm finds the shortest path distance from <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">s</code> to every other vertex in the graph.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Greedy Strategy
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              Always extracts the unvisited vertex with the smallest tentative distance from the priority queue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Optimal Substructure
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              Any subpath of a shortest path between two vertices is itself a shortest path between those vertices.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              Non-Negative Weights
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              Requires all edge weights w ≥ 0, guaranteeing that visiting a node permanently finalizes its minimal distance.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Process (8 Steps matching project requirements) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Milestone className="w-5 h-5 text-indigo-500" />
          <span>Step-by-Step Algorithmic Procedure</span>
        </h3>

        <div className="space-y-3 pt-1">
          {[
            {
              step: '1',
              title: 'Distance Initialization',
              desc: 'Set distance to source vertex dist[source] = 0. Set dist[v] = ∞ for all other vertices v ∈ V. Set parent[v] = NULL for all v.'
            },
            {
              step: '2',
              title: 'Visited Set Initialization',
              desc: 'Initialize an empty visited set visited = ∅ (or boolean array visited[v] = false for all v).'
            },
            {
              step: '3',
              title: 'Priority Queue Initialization',
              desc: 'Insert all vertices into a Min-Heap Priority Queue Q, keyed by their current tentative distance value.'
            },
            {
              step: '4',
              title: 'Extract Minimum Vertex',
              desc: 'Extract vertex u with minimum dist[u] from Q: u = Q.extractMin().'
            },
            {
              step: '5',
              title: 'Mark as Finalized',
              desc: 'Mark u as visited. The distance dist[u] is now mathematically proven to be minimal and immutable.'
            },
            {
              step: '6',
              title: 'Relax Outgoing Neighbors',
              desc: 'For each unvisited neighbor v of u: If dist[u] + weight(u, v) < dist[v], update dist[v] = dist[u] + weight(u, v), set parent[v] = u, and decrease-key in Q.'
            },
            {
              step: '7',
              title: 'Queue Loop Termination',
              desc: 'Repeat Steps 4–6 until the Priority Queue Q is empty or the target destination node is extracted.'
            },
            {
              step: '8',
              title: 'Path Reconstruction',
              desc: 'Reconstruct the actual path by following parent pointers backwards from destination to source, then reverse the order.'
            }
          ].map(item => (
            <div
              key={item.step}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                  {item.title}:
                </span>
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pseudocode Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <span>Formal Pseudocode (Min-Heap Implementation)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            Time: O((V + E) log V)
          </span>
        </div>

        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
          <pre>{`function Dijkstra(Graph G, Source s):
  1:  // Step 1: Initialization
  2:  for each vertex v in G.vertices:
  3:      dist[v] ← ∞
  4:      parent[v] ← NULL
  5:      visited[v] ← FALSE
  6:  dist[s] ← 0
  7:
  8:  // Step 2: Initialize Min-Heap Priority Queue
  9:  Q ← MinHeap()
 10:  Q.insert(s, 0)
 11:
 12:  while not Q.isEmpty():
 13:      (u, d) ← Q.extractMin()
 14:      
 15:      if visited[u]:
 16:          continue
 17:      visited[u] ← TRUE
 18:
 19:      // Step 3: Edge Relaxation for adjacent neighbors
 20:      for each neighbor v in G.adj[u]:
 21:          weight ← G.weight(u, v)
 22:          if not visited[v] and dist[u] + weight < dist[v]:
 23:              dist[v] ← dist[u] + weight
 24:              parent[v] ← u
 25:              Q.insert(v, dist[v])
 26:
 27:  return dist, parent`}</pre>
        </div>
      </div>

      {/* 4. Worked Numerical Example (4-Node Academic Demo Graph) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Worked Numerical Trace (Academic 4-Node Graph)</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Step-by-step mathematical execution trace for vertices <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&#123;A, B, C, D&#125;</code> with edge weights: <br />
          <code className="font-mono text-emerald-600 dark:text-emerald-400">A-B = 4 km, A-C = 2 km, B-D = 5 km, C-D = 3 km, B-C = 1 km</code>.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Iteration</th>
                <th className="py-2.5 px-3">Extracted Vertex u</th>
                <th className="py-2.5 px-3">Edge Relaxation & Calculations</th>
                <th className="py-2.5 px-3">dist[A]</th>
                <th className="py-2.5 px-3">dist[B]</th>
                <th className="py-2.5 px-3">dist[C]</th>
                <th className="py-2.5 px-3">dist[D]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="py-2 px-3 font-bold font-sans">Initial</td>
                <td className="py-2 px-3 text-slate-400">—</td>
                <td className="py-2 px-3 text-slate-500 font-sans">Set dist[A] = 0, all others = ∞</td>
                <td className="py-2 px-3 font-bold text-emerald-600">0</td>
                <td className="py-2 px-3 text-slate-400">∞</td>
                <td className="py-2 px-3 text-slate-400">∞</td>
                <td className="py-2 px-3 text-slate-400">∞</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold font-sans">Iter 1</td>
                <td className="py-2 px-3 font-bold text-emerald-600">A (dist=0)</td>
                <td className="py-2 px-3 font-sans">
                  Relax (A,B): 0+4=4 &lt; ∞; Relax (A,C): 0+2=2 &lt; ∞
                </td>
                <td className="py-2 px-3 text-slate-400">0✓</td>
                <td className="py-2 px-3">4 (via A)</td>
                <td className="py-2 px-3 font-bold text-indigo-600">2 (via A)</td>
                <td className="py-2 px-3 text-slate-400">∞</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold font-sans">Iter 2</td>
                <td className="py-2 px-3 font-bold text-emerald-600">C (dist=2)</td>
                <td className="py-2 px-3 font-sans">
                  Relax (C,B): 2+1=3 &lt; 4 (updated!); Relax (C,D): 2+3=5 &lt; ∞
                </td>
                <td className="py-2 px-3 text-slate-400">0✓</td>
                <td className="py-2 px-3 font-bold text-indigo-600">3 (via C)</td>
                <td className="py-2 px-3 text-slate-400">2✓</td>
                <td className="py-2 px-3">5 (via C)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold font-sans">Iter 3</td>
                <td className="py-2 px-3 font-bold text-emerald-600">B (dist=3)</td>
                <td className="py-2 px-3 font-sans">
                  Relax (B,D): 3+5=8 &gt; 5 (no change)
                </td>
                <td className="py-2 px-3 text-slate-400">0✓</td>
                <td className="py-2 px-3 text-slate-400">3✓</td>
                <td className="py-2 px-3 text-slate-400">2✓</td>
                <td className="py-2 px-3 font-bold text-emerald-600">5 (via C)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold font-sans">Iter 4</td>
                <td className="py-2 px-3 font-bold text-emerald-600">D (dist=5)</td>
                <td className="py-2 px-3 font-sans">
                  Final destination extracted. Optimal path reconstructed!
                </td>
                <td className="py-2 px-3 text-slate-400">0✓</td>
                <td className="py-2 px-3 text-slate-400">3✓</td>
                <td className="py-2 px-3 text-slate-400">2✓</td>
                <td className="py-2 px-3 text-slate-400">5✓</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100 font-semibold">
          Final Shortest Route to D: <span className="font-mono">A → C → D</span> (Total Distance: <span className="font-mono">5 km</span>).
        </div>
      </div>

      {/* 5. Advantages & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Advantages of Dijkstra</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
            <li><strong>Guaranteed Optimality:</strong> Mathematically proven to find the global minimum path for non-negative weights.</li>
            <li><strong>Single Source Versatility:</strong> Computes shortest paths to all reachable destinations in a single run.</li>
            <li><strong>High Efficiency:</strong> Highly scalable with a Min-Heap priority queue O((V + E) log V).</li>
            <li><strong>Foundation for GPS:</strong> Used in real road networks, routing protocols (OSPF, IS-IS), and network packet switching.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Limitations & Alternatives</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
            <li><strong>No Negative Weights:</strong> Cannot handle negative edge weights. Solution: Use Bellman-Ford O(V·E).</li>
            <li><strong>Negative Cycles:</strong> Fails completely or enters infinite cycles if negative cycles exist.</li>
            <li><strong>Uniform Blind Expansion:</strong> Explores in all directions without target orientation. Solution: Use A* Search with Euclidean heuristic.</li>
            <li><strong>Dense Graphs:</strong> Simple array implementation O(V²) may outperform heaps if E ≈ V².</li>
          </ul>
        </div>
      </div>

      {/* 6. Viva Preparation Guide Q&A */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Academic Viva Questions & Answers (DAA Exam Guide)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key theoretical and practical questions frequently asked in college viva-voce examinations.
          </p>
        </div>

        <div className="space-y-2.5">
          {vivaQuestions.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>{item.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
