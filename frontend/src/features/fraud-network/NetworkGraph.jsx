import { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Custom node styling based on type
const getNodeStyle = (type, isFlagged) => {
  const baseStyle = {
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #374151',
    color: '#fff',
    boxShadow: isFlagged ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none',
  };

  switch (type) {
    case 'victim':
      return { ...baseStyle, background: '#1e3a8a', borderColor: '#3b82f6' };
    case 'suspect':
      return { ...baseStyle, background: '#7f1d1d', borderColor: '#ef4444' };
    case 'phone':
      return { ...baseStyle, background: '#1f2937', borderRadius: '20px' };
    case 'upi':
      return { ...baseStyle, background: '#4c1d95', borderColor: '#8b5cf6' };
    case 'account':
      return { ...baseStyle, background: '#064e3b', borderColor: '#10b981' };
    case 'device':
      return { ...baseStyle, background: '#78350f', borderColor: '#f59e0b', borderRadius: '4px' };
    default:
      return { ...baseStyle, background: '#1f2937' };
  }
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 100 });

  nodes.forEach((node) => {
    // Estimating node width and height based on the style
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    
    // Dagre returns the center, React Flow needs top left
    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 25,
    };
  });

  return { nodes, edges };
};

export default function NetworkGraph({ data, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;

    // Transform backend nodes to React Flow format
    const initialNodes = data.nodes.map((node) => {
      return {
        id: node.node_id,
        position: { x: 0, y: 0 },
        data: { label: node.label },
        style: getNodeStyle(node.node_type, node.is_flagged),
      };
    });

    // Transform backend edges
    const initialEdges = data.edges.map((edge, i) => ({
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      label: edge.edge_type,
      type: 'smoothstep',
      animated: edge.weight > 0.8,
      style: { stroke: edge.weight > 0.8 ? '#ef4444' : '#6b7280', strokeWidth: 2 },
      labelStyle: { fill: '#9ca3af', fontWeight: 500 },
      labelBgStyle: { fill: '#1f2937' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.weight > 0.8 ? '#ef4444' : '#6b7280',
      },
    }));

    // Apply Dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full border border-gray-700/50 rounded-xl overflow-hidden bg-gray-900/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
        attributionPosition="bottom-right"
        className="dark"
      >
        <Background color="#374151" gap={16} size={1} />
        <Controls className="bg-gray-800 border-gray-700 fill-white" />
        <MiniMap 
          nodeColor={(n) => n.style?.background || '#374151'} 
          maskColor="rgba(17, 24, 39, 0.7)"
          className="bg-gray-900"
        />
      </ReactFlow>
    </div>
  );
}
