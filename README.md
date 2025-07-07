# Emergency-Route-Planner(DSA)
# Motivation
In emergency situations such as ambulance movement, fire rescue, or police response, reaching the destination quickly is extremely important. Delays caused by heavy traffic, roadblocks, or accidents can lead to serious consequences. In such cases, we need a smart system that can always find the fastest and safest route even when the road conditions are changing.
This project, called "Emergency Route Planner", aims to solve this problem using Dijkstra’s Algorithm, which is a well-known method for finding the shortest path in a graph when all edge weights are non-negative.The motivation behind this project is to go beyond theory and show how DSA concepts like Dijkstra’s algorithm can solve real-world problems—especially in emergency planning where every second matters.

# Project Overview
In our system, we represent a city map as a graph where nodes represent places (intersections) and edges represent roads. Each road has a weight which is the sum of its physical distance and current traffic level.
Now, in real life, two common problems can occur:
1.	Traffic changes from time to time, increasing travel time.
2.	Roads may get blocked due to accidents or emergencies.
To simulate these problems, we added two features:
•	Random traffic updates: This represents how traffic can increase or decrease at any moment.
•	Blocking roads or places: If a road is blocked, we simulate it by setting a very high weight (or infinity) to stop the algorithm from choosing that path.
After any such change, Dijkstra’s Algorithm recalculates the best route from the starting point to the destination.
The motivation behind this project is to go beyond theory and show how DSA concepts like Dijkstra’s algorithm can solve real-world problems—especially in emergency planning where every second matters.

# Possible Solution
To solve the emergency routing problem, we used a graph-based approach where each location is represented as a node and each road as an edge with a weight. These weights are based on both distance and traffic level (i.e., weight = distance + traffic), allowing us to simulate real-time travel difficulty.
We selected Dijkstra’s Algorithm because it reliably finds the shortest and most efficient path when all edge weights are non-negative which fits our use case perfectly.
To make the system more realistic, we added two important features:
1.	Random Traffic Simulation
 In real life, traffic conditions change frequently due to congestion, peak hours, or events. To replicate this, we randomly update traffic levels on roads. These updated values are added to the base distance, dynamically changing the total weight. Dijkstra’s algorithm then recalculates the shortest path in real-time, showing how routes adapt to traffic.
2.	Node and Road Blocking
 During emergencies such as accidents or construction work, some roads or areas become inaccessible. We simulate this by "blocking" a node or road — setting its connecting edge weights to infinity. This prevents Dijkstra from considering them, just like how emergency services would reroute.
To enhance understanding, we provide animated visualizations that clearly show the step-by-step pathfinding process. This helps users see exactly how and why the algorithm selects a particular path under different traffic and block conditions.

# Graph Justification
In our Emergency Route Planner project, we chose a graph as the main data structure. A graph is the best way to represent a map where nodes are places (like intersections or hospitals) and edges are the roads connecting those places. Each edge has a weight, which in our case is the sum of distance and traffic level. This helps us show how hard or easy it is to travel on a road at any moment.
A graph is perfect for this kind of situation for many reasons:
1.	It matches real-world road systems – Just like in cities, places are connected by roads, and traffic can make some paths slower than others.
2.	We can easily find the shortest path – Using Dijkstra’s algorithm on a graph helps us quickly find the best route.
3.	It supports dynamic changes – We can change traffic levels by updating edge weights, or block roads by removing nodes or setting weights to infinity.
4.	It handles growth well – As more places and roads are added, the graph can grow without making the system slow or hard to manage.
Other structures like arrays or matrices can’t handle these operations easily. For example, updating a road or finding a path would be more complicated and slow.
So, using a graph helps us keep the design simple, realistic, and flexible — especially when simulating traffic and emergency path changes in real-time.
 
![image](https://github.com/user-attachments/assets/2c06d8d0-dfcb-4973-8b95-a9fca10cd459)


# Implementation Details
The system employs a hybrid graph structure combining adjacency lists for pathfinding efficiency with coordinate-based visualization. Nodes are stored as objects containing unique IDs, labels, and x/y coordinates in a React state array, while edges maintain source/target IDs, base weights (distance), and dynamic traffic levels (1-10). This design enables O(1) node lookup while preserving spatial relationships for rendering.
The system employs a hybrid graph structure combining adjacency lists for pathfinding efficiency with coordinate-based visualization. Nodes are stored as objects containing unique IDs, labels, and x/y coordinates in a React state array, while edges maintain source/target IDs, base weights (distance), and dynamic traffic levels (1-10). This design enables O(1) node lookup while preserving spatial relationships for rendering.

The traffic simulation integrates two weight components per edge: static distance and dynamic traffic level. These weights combine during pathfinding to realistically represent travel costs. Traffic levels update independently, allowing real-time congestion simulation through uniform distribution randomization between 1-10 with color-coded traffic visualization 
	Green: Low traffic (1-2) 
	Orange: Medium traffic (3-5)
	Red: High traffic (6-10).

Dijkstra's algorithm implementation utilizes three core data structures: a distances object tracking shortest known paths, a previousNodes object storing optimal path information, and a Set object (unvisitedNodes) for efficient selection. The algorithm initializes distances (0 for start, infinity for others), then iteratively selects minimum-distance nodes, updates neighbor distances, and tracks visited nodes for animation before reconstructing the final path.

The node blocking mechanism modifies graph structure by setting connected edge weights to infinity rather than removing nodes, maintaining graph integrity while forcing alternative route calculations. This triggers immediate path recalculation, ensuring routes avoid blocked intersections.
Path finding combines distance and traffic through composite weight calculations (sum of base weight and traffic level). The system maintains a history of calculated paths, including start/end nodes, path sequences, total costs, and blocked nodes, enabling routing decision analysis.
The data export functionality generates distance, traffic, and cost matrices using nested arrays where cell [i][j] represents node relationships. Exports include timestamps and formatted path histories for comprehensive analysis.
Time complexity analysis reveals O(V² + E) overall complexity, where V is vertex count and E is edge count. This derives from:
Main loop processing each vertex once (V iterations)
Finding minimum distance node per iteration (O(V) operations)
Processing each edge once for undirected graphs (O(E) operations)
Matrix generation requiring O(V²) initialization plus O(E) population
Node blocking introduces O(E) operations for edge marking but doesn't affect overall complexity as Dijkstra's algorithm dominates. Traffic updates require O(E) operations for randomization, while path recalculation maintains O(V² + E) complexity.

For sparse graphs (E << V²) the E term becomes less significant, with V² dominating performance. For dense graphs (E ≈ V²) effectively run in O(V²) time. 

# Results
•	Supports real-time shortest path calculation for up to 50 nodes smoothly.
•	Pathfinding visualization runs without lag, even during dynamic changes.
•	Instant updates when traffic changes or a node is blocked.
•	Responsive UI with interactive controls and clear animations.
•	Efficient export options for saving path data and graphs.
![image](https://github.com/user-attachments/assets/c1b0d668-7cc1-443e-a316-d5c80ab2437b)
![image](https://github.com/user-attachments/assets/efbc5eae-c113-4f6b-8d66-ff0dfcf1969a)
![image](https://github.com/user-attachments/assets/f0f46580-493c-4721-bb3c-fbb68e7fea81)
![image](https://github.com/user-attachments/assets/0a396a3f-34d4-49dd-8436-5f693c9952b9)
![image](https://github.com/user-attachments/assets/ca54569f-793b-47e3-844f-f4073d6aaba2)


