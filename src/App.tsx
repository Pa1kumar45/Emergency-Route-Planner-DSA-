import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, Play, RotateCcw, ArrowRight, AlertTriangle, Download, Ban } from 'lucide-react';
import { dijkstra } from './algorithms/dijkstra';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [edgeStart, setEdgeStart] = useState(null);
  const [path, setPath] = useState([]);
  const [visitedOrder, setVisitedOrder] = useState([]);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [blockedNode, setBlockedNode] = useState(null);
  const [canBlockNode, setCanBlockNode] = useState(false);
  const [pathHistory, setPathHistory] = useState([]);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Initialize canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Check if this edge is part of the path
        const isInPath = path.some((pathEdge, i) => 
          i < path.length - 1 && 
          ((path[i] === edge.source && path[i + 1] === edge.target) || 
           (path[i] === edge.target && path[i + 1] === edge.source))
        );

        // Check if edge is connected to blocked node
        const isBlocked = blockedNode && (edge.source === blockedNode || edge.target === blockedNode);

        // Set edge color based on status
        if (isBlocked) {
          ctx.strokeStyle = '#ff0000'; // Red for blocked edges
          ctx.lineWidth = 4;
        } else if (isInPath) {
          ctx.strokeStyle = '#4CAF50'; // Green for path
          ctx.lineWidth = 4;
        } else {
          const trafficColor = getTrafficColor(edge.trafficLevel);
          ctx.strokeStyle = trafficColor;
          ctx.lineWidth = 2;
        }

        // Draw the edge
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();

        // Draw the weight/distance label
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        const totalCost = edge.weight + edge.trafficLevel;
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`D: ${edge.weight}`, midX + 10, midY);
        ctx.fillText(`T: ${edge.trafficLevel}`, midX + 10, midY + 15);
        ctx.fillText(`C: ${totalCost}`, midX + 10, midY + 30);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      let fillColor = '#3498db'; // Default blue
      
      if (node.id === blockedNode) {
        fillColor = '#ff0000'; // Red for blocked node
      } else if (node.id === startNode) {
        fillColor = '#2ecc71'; // Green for start node
      } else if (node.id === endNode) {
        fillColor = '#e74c3c'; // Red for end node
      } else if (visitedOrder.includes(node.id)) {
        fillColor = '#9b59b6'; // Purple for visited nodes
      }
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });

  }, [nodes, edges, path, visitedOrder, startNode, endNode, blockedNode, canvasSize]);

  // Get color based on traffic level
  const getTrafficColor = (trafficLevel) => {
    if (trafficLevel <= 2) return '#2ecc71'; // Low traffic - green
    if (trafficLevel <= 5) return '#f39c12'; // Medium traffic - orange
    return '#e74c3c'; // High traffic - red
  };

  // Create adjacency matrices and export data
  const createMatrices = () => {
    const nodeCount = nodes.length;
    const distanceMatrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(Infinity));
    const trafficMatrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(Infinity));
    const costMatrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(Infinity));

    edges.forEach(edge => {
      const sourceIndex = nodes.findIndex(n => n.id === edge.source);
      const targetIndex = nodes.findIndex(n => n.id === edge.target);
      
      // Set distance
      distanceMatrix[sourceIndex][targetIndex] = edge.weight;
      distanceMatrix[targetIndex][sourceIndex] = edge.weight;
      
      // Set traffic
      trafficMatrix[sourceIndex][targetIndex] = edge.trafficLevel;
      trafficMatrix[targetIndex][sourceIndex] = edge.trafficLevel;
      
      // Set total cost (distance + traffic)
      const totalCost = edge.weight + edge.trafficLevel;
      costMatrix[sourceIndex][targetIndex] = totalCost;
      costMatrix[targetIndex][sourceIndex] = totalCost;
      
      // If node is blocked, set cost to Infinity
      if (blockedNode) {
        const blockedIndex = nodes.findIndex(n => n.id === blockedNode);
        if (sourceIndex === blockedIndex || targetIndex === blockedIndex) {
          costMatrix[sourceIndex][targetIndex] = Infinity;
          costMatrix[targetIndex][sourceIndex] = Infinity;
        }
      }
    });

    return { distanceMatrix, trafficMatrix, costMatrix };
  };

  // Export graph data
  const exportGraphData = () => {
    const { distanceMatrix, trafficMatrix, costMatrix } = createMatrices();
    const timestamp = new Date().toISOString();
    
    // Format matrices for display
    const formatMatrix = (matrix) => 
      matrix.map(row => row.map(val => 
        val === Infinity ? '∞' : val.toString().padStart(3)
      ).join(' ')).join('\n');

    // Create content with path history
    let content = `=== Graph Data Export (${timestamp}) ===\n\n`;
    
    // Add path history
    content += '=== Path History ===\n';
    pathHistory.forEach((record, index) => {
      content += `\nPath ${index + 1}:\n`;
      content += `Start: ${nodes.find(n => n.id === record.start)?.label}\n`;
      content += `End: ${nodes.find(n => n.id === record.end)?.label}\n`;
      content += `Path: ${record.path.map(id => nodes.find(n => n.id === id)?.label).join(' → ')}\n`;
      content += `Total Cost: ${record.cost}\n`;
      if (record.blockedNode) {
        content += `Blocked Node: ${nodes.find(n => n.id === record.blockedNode)?.label}\n`;
      }
    });

    // Add matrices
    content += '\n=== Distance Matrix ===\n';
    content += formatMatrix(distanceMatrix);
    content += '\n\n=== Traffic Matrix ===\n';
    content += formatMatrix(trafficMatrix);
    content += '\n\n=== Total Cost Matrix ===\n';
    content += formatMatrix(costMatrix);

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph_data_${timestamp.replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run Dijkstra's algorithm
  const runDijkstra = (considerTraffic = false, blockedNodeId = null) => {
    if (!startNode || !endNode) {
      alert('Please select both start and end nodes');
      return;
    }

    // Reset previous path
    setPath([]);
    setVisitedOrder([]);
    
    // Create a graph representation for Dijkstra's algorithm
    const graph = {};
    
    nodes.forEach(node => {
      graph[node.id] = {};
    });
    
    edges.forEach(edge => {
      // Skip edges connected to blocked node
      if (blockedNodeId && (edge.source === blockedNodeId || edge.target === blockedNodeId)) {
        return;
      }

      // Calculate total weight based on distance and traffic
      let totalWeight = edge.weight;
      if (considerTraffic) {
        totalWeight = edge.weight + edge.trafficLevel; // Changed to addition for total cost
      }
      
      // Undirected graph - add both directions
      graph[edge.source][edge.target] = totalWeight;
      graph[edge.target][edge.source] = totalWeight;
    });
    
    // Run Dijkstra's algorithm
    const result = dijkstra(graph, startNode, endNode);
    
    if (result.path.length > 0) {
      // Add to path history
      setPathHistory(prev => [...prev, {
        start: startNode,
        end: endNode,
        path: result.path,
        cost: result.totalCost,
        blockedNode: blockedNodeId
      }]);

      // Animate the path finding process
      setAnimationInProgress(true);
      
      // Animate visited nodes first
      const visitedAnimation = result.visited.map((node, index) => {
        return setTimeout(() => {
          setVisitedOrder(prev => [...prev, node]);
        }, index * 200);
      });
      
      // Then animate the final path
      setTimeout(() => {
        setPath(result.path);
        setAnimationInProgress(false);
      }, result.visited.length * 200 + 500);
      
      return () => {
        visitedAnimation.forEach(timeout => clearTimeout(timeout));
      };
    } else {
      alert('No path found between the selected nodes');
      setAnimationInProgress(false);
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    setPath([]);
    setVisitedOrder([]);
    setStartNode(null);
    setEndNode(null);
    setSelectedNode(null);
    setBlockedNode(null);
    setCanBlockNode(false);
    setPathHistory([]);
  };

  // Delete a node
  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setEdges(edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    
    if (startNode === nodeId) setStartNode(null);
    if (endNode === nodeId) setEndNode(null);
    if (selectedNode === nodeId) setSelectedNode(null);
    if (blockedNode === nodeId) setBlockedNode(null);
  };

  // Start adding an edge
  const startAddingEdge = () => {
    if (selectedNode) {
      setIsAddingEdge(true);
      setEdgeStart(selectedNode);
    } else {
      alert('Please select a node first');
    }
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If we're adding an edge
    if (isAddingEdge && edgeStart) {
      // Check if clicked on a node
      const clickedNode = nodes.find(node => 
        Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < 20
      );

      if (clickedNode && clickedNode.id !== edgeStart) {
        // Check if edge already exists
        const edgeExists = edges.some(edge => 
          (edge.source === edgeStart && edge.target === clickedNode.id) ||
          (edge.source === clickedNode.id && edge.target === edgeStart)
        );

        if (!edgeExists) {
          const weight = parseInt(prompt('Enter distance (1-10):', '5'), 10);
          const trafficLevel = parseInt(prompt('Enter traffic level (1-10):', '1'), 10);
          
          if (!isNaN(weight) && !isNaN(trafficLevel)) {
            setEdges([...edges, {
              id: `edge-${edges.length}`,
              source: edgeStart,
              target: clickedNode.id,
              weight: Math.min(Math.max(weight, 1), 10),
              trafficLevel: Math.min(Math.max(trafficLevel, 1), 10)
            }]);
          }
        }
        
        setIsAddingEdge(false);
        setEdgeStart(null);
      }
    } else {
      // Check if clicked on an existing node
      const clickedNode = nodes.find(node => 
        Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < 20
      );

      if (clickedNode) {
        if (canBlockNode && path.includes(clickedNode.id)) {
          setBlockedNode(clickedNode.id);
          setCanBlockNode(false);
          // Find the node before the blocked node in the path
          const nodeIndex = path.indexOf(clickedNode.id);
          if (nodeIndex > 0) {
            setStartNode(path[nodeIndex - 1]);
            runDijkstra(true, clickedNode.id);
          }
        } else {
          setSelectedNode(clickedNode.id);
        }
      } else {
        // Add a new node
        const newNodeId = `node-${nodes.length}`;
        const label = prompt('Enter node label:', `N${nodes.length + 1}`);
        
        if (label) {
          setNodes([...nodes, {
            id: newNodeId,
            label,
            x,
            y
          }]);
        }
      }
    }
  };

  // Set start node manually
  const setStartNodeManually = () => {
    const nodeLabels = nodes.map(node => node.label).join(', ');
    const startLabel = prompt(`Enter the label of the start node (Available nodes: ${nodeLabels}):`);
    const node = nodes.find(n => n.label === startLabel);
    if (node) {
      setStartNode(node.id);
      setSelectedNode(null);
    } else {
      alert('Invalid node label!');
    }
  };

  // Set end node manually
  const setEndNodeManually = () => {
    const nodeLabels = nodes.map(node => node.label).join(', ');
    const endLabel = prompt(`Enter the label of the end node (Available nodes: ${nodeLabels}):`);
    const node = nodes.find(n => n.label === endLabel);
    if (node) {
      setEndNode(node.id);
      setSelectedNode(null);
    } else {
      alert('Invalid node label!');
    }
  };

  // Randomize traffic
  const randomizeTraffic = () => {
    const newEdges = edges.map(edge => ({
      ...edge,
      trafficLevel: Math.floor(Math.random() * 10) + 1
    }));
    setEdges(newEdges);
    
    // If there's a current path, recalculate with new traffic values
    if (path.length > 0) {
      runDijkstra(true, blockedNode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold flex items-center">
          <MapPin className="mr-2" /> Emergency Route Planner
        </h1>
        <p className="text-sm opacity-80">Using Dijkstra's Algorithm for optimal path finding</p>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md p-4 flex flex-col">
          <h2 className="font-bold text-lg mb-4">Controls</h2>
          
          <div className="space-y-4 flex-1">
            <div>
              <button 
                onClick={startAddingEdge}
                disabled={!selectedNode}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} className="mr-1" /> Add Connection
              </button>
            </div>
            
            <div>
              <button 
                onClick={() => selectedNode && deleteNode(selectedNode)}
                disabled={!selectedNode}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} className="mr-1" /> Delete Node
              </button>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Route Planning</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={setStartNodeManually}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center"
                >
                  Set Start Node
                </button>
                
                <button 
                  onClick={setEndNodeManually}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center"
                >
                  Set End Node
                </button>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Simulation</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => runDijkstra(true)}
                  disabled={!startNode || !endNode || animationInProgress}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={18} className="mr-1" /> Find Shortest Path and Simulate Traffic
                </button>

                <button 
                  onClick={randomizeTraffic}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center justify-center"
                >
                  <AlertTriangle size={18} className="mr-1" /> Randomize Traffic
                </button>

                <button 
                  onClick={() => setCanBlockNode(true)}
                  disabled={!path.length}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ban size={18} className="mr-1" /> Block Node
                </button>

                <button 
                  onClick={exportGraphData}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
                >
                  <Download size={18} className="mr-1" /> Export Graph Data
                </button>
                
                <button 
                  onClick={resetSimulation}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center"
                >
                  <RotateCcw size={18} className="mr-1" /> Reset
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Start Node</p>
              <p><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> End Node</p>
              <p><span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span> Visited Node</p>
              <p><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Regular Node</p>
              <p><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> Blocked Node</p>
              <p className="mt-2"><span className="inline-block w-8 h-2 bg-green-500 mr-1"></span> Optimal Path</p>
              <p><span className="inline-block w-8 h-2 bg-red-500 mr-1"></span> Blocked Road</p>
            </div>
          </div>
        </div>
        
        {/* Main canvas area */}
        <div className="flex-1 p-4 relative" id="canvas-container">
          <canvas 
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleCanvasClick}
            className="border border-gray-300 bg-white rounded-lg shadow-inner w-full h-full"
          ></canvas>
          
          {/* Status indicators */}
          <div className="absolute top-6 right-6 bg-white p-3 rounded-lg shadow-md">
            <div className="text-sm">
              {startNode && (
                <p className="flex items-center">
                  <span className="font-semibold">Start:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                    {nodes.find(n => n.id === startNode)?.label || 'Node'}
                  </span>
                </p>
              )}
              
              {endNode && (
                <p className="flex items-center mt-1">
                  <span className="font-semibold">End:</span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded">
                    {nodes.find(n => n.id === endNode)?.label || 'Node'}
                  </span>
                </p>
              )}
              
              {selectedNode && (
                <p className="flex items-center mt-1">
                  <span className="font-semibold">Selected:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {nodes.find(n => n.id === selectedNode)?.label || 'Node'}
                  </span>
                </p>
              )}

              {blockedNode && (
                <p className="flex items-center mt-1">
                  <span className="font-semibold">Blocked:</span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded">
                    {nodes.find(n => n.id === blockedNode)?.label || 'Node'}
                  </span>
                </p>
              )}
              
              {path.length > 0 && (
                <p className="flex items-center mt-1">
                  <span className="font-semibold">Path:</span>
                  <span className="ml-2 text-sm">
                    {path.map(nodeId => nodes.find(n => n.id === nodeId)?.label).join(' → ')}
                  </span>
                </p>
              )}

              {canBlockNode && (
                <p className="flex items-center mt-1 text-red-600">
                  <AlertTriangle size={14} className="mr-1" />
                  Click a node in the path to block it
                </p>
              )}
            </div>
          </div>
          
          {/* Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg max-w-md text-center">
                <h3 className="text-xl font-bold mb-2">Getting Started</h3>
                <p className="mb-4">Click anywhere on the canvas to add nodes, then connect them to create your emergency route network.</p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mx-auto mb-2">1</div>
                    <p className="text-sm">Add Nodes</p>
                  </div>
                  <ArrowRight className="mt-4 text-gray-400" />
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mx-auto mb-2">2</div>
                    <p className="text-sm">Connect Nodes</p>
                  </div>
                  <ArrowRight className="mt-4 text-gray-400" />
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mx-auto mb-2">3</div>
                    <p className="text-sm">Find Routes</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;