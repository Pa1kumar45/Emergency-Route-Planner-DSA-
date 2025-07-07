/**
 * Implementation of Dijkstra's algorithm for finding the shortest path
 * between two nodes in a graph.
 * 
 * @param {Object} graph - The graph representation as an adjacency list
 * @param {string} startNode - The ID of the starting node
 * @param {string} endNode - The ID of the target node
 * @returns {Object} - Object containing the shortest path, visited nodes, and total cost
 */
export function dijkstra(graph, startNode, endNode) {
  // Initialize data structures
  const distances = {}; // Shortest distance from start to each node
  const previousNodes = {}; // Previous node in optimal path
  const unvisitedNodes = new Set(); // Set of unvisited nodes
  const visitedNodesInOrder = []; // Order in which nodes were visited
  
  // Initialize all distances as infinity and add all nodes to unvisited set
  for (const node in graph) {
    distances[node] = node === startNode ? 0 : Infinity;
    unvisitedNodes.add(node);
  }
  
  // Main algorithm loop
  while (unvisitedNodes.size > 0) {
    // Find the unvisited node with the smallest distance
    let currentNode = null;
    let smallestDistance = Infinity;
    
    for (const node of unvisitedNodes) {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    }
    
    // If we can't find a node with a finite distance, there's no path
    if (currentNode === null || distances[currentNode] === Infinity) {
      break;
    }
    
    // If we've reached the end node, we're done
    if (currentNode === endNode) {
      break;
    }
    
    // Remove current node from unvisited set and add to visited order
    unvisitedNodes.delete(currentNode);
    visitedNodesInOrder.push(currentNode);
    
    // Update distances to neighboring nodes
    for (const neighbor in graph[currentNode]) {
      // Skip if neighbor has been visited
      if (!unvisitedNodes.has(neighbor)) continue;
      
      // Calculate new distance to neighbor
      const edgeWeight = graph[currentNode][neighbor];
      const newDistance = distances[currentNode] + edgeWeight;
      
      // If new distance is shorter, update
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previousNodes[neighbor] = currentNode;
      }
    }
  }
  
  // Reconstruct the shortest path
  const path = [];
  let currentNode = endNode;
  
  // If end node was never reached, return empty path
  if (previousNodes[endNode] === undefined && endNode !== startNode) {
    return { path: [], visited: visitedNodesInOrder, totalCost: Infinity };
  }
  
  // Add end node to path
  path.unshift(endNode);
  
  // Trace back from end node to start node
  while (currentNode !== startNode) {
    currentNode = previousNodes[currentNode];
    path.unshift(currentNode);
  }
  
  return {
    path,
    visited: visitedNodesInOrder,
    totalCost: distances[endNode]
  };
}