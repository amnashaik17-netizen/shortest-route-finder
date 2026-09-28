# 🚀 SmartRoute – GPS Shortest Route Finder

SmartRoute is a web-based **GPS Shortest Route Finder** that calculates the shortest path between two locations using **Dijkstra's Algorithm**.

The application represents locations as graph vertices and roads as weighted edges. It uses an **Adjacency List** and a **Min-Heap Priority Queue** to efficiently calculate the shortest route.

---

## 📌 Project Overview

SmartRoute provides an interactive dashboard where users can:

- Select a source location
- Select a destination location
- Calculate the shortest route
- View the route on an interactive network graph
- View distance between locations
- Explore locations and roads
- Visualize the graph
- View previous route calculations
- Store route history using SQLite
- Load demo datasets for testing

The project is designed to demonstrate the practical application of **Data Structures and Algorithms (DSA)**, especially **Dijkstra's Shortest Path Algorithm**.

---

## ✨ Features

### 🗺️ Route Finder
- Select starting and destination locations.
- Calculate the shortest route.
- Display the total route distance.
- Show the calculated path between locations.

### 📊 Dashboard
The dashboard provides an overview of:

- Total Locations
- Total Roads
- Routes Calculated
- Average Distance

### 🌐 Interactive Network Visualization
- Displays locations as graph vertices.
- Displays roads as graph edges.
- Shows distances between connected locations.
- Allows users to visually understand the network.

### 📍 Locations
Manage and view the available locations in the road network.

### 🛣️ Roads
View roads connecting different locations along with their distances.

### 📈 Graph Visualizer
Provides a visual representation of the complete graph/network.

### 🕒 Route History
Previously calculated routes are stored and displayed using SQLite.

### 🗄️ SQLite Database
The application uses SQLite for persistent storage of:

- Locations
- Roads
- Route calculations
- Route history

### 🧪 Demo Dataset
A demo dataset is provided to quickly populate the application with sample locations and roads.

---

## 🧠 Algorithm Used

### Dijkstra's Algorithm

SmartRoute uses **Dijkstra's Algorithm** to find the shortest path between a source vertex and destination vertex in a weighted graph with non-negative edge weights.

### Working

1. Select the source location.
2. Assign distance `0` to the source.
3. Assign infinity to all other vertices.
4. Insert the source into the Min-Heap Priority Queue.
5. Select the vertex with the smallest known distance.
6. Examine its neighboring vertices.
7. Update their distances if a shorter path is found.
8. Continue until the destination is reached.
9. Reconstruct and display the shortest path.

---

## 🏗️ Data Structures

The project uses:

### Adjacency List

The graph is represented using an adjacency list.

```text
Location A
 ├── Location B → 2.5 km
 ├── Location C → 4.1 km
 └── Location D → 3.7 km

<img width="1349" height="582" alt="image" src="https://github.com/user-attachments/assets/79c4615b-7378-4e76-aa5b-4530072ad181" />
<img width="1354" height="514" alt="image" src="https://github.com/user-attachments/assets/8986cfaf-a12e-4796-8124-42155e15ab47" />
<img width="1326" height="540" alt="image" src="https://github.com/user-attachments/assets/19168ee6-13a3-4a4b-84b9-822ca7f38650" />
<img width="1355" height="590" alt="image" src="https://github.com/user-attachments/assets/021d601b-cf97-48a1-9b5c-d8844ff92047" />



