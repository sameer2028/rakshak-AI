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

export default function NetworkGraph({ data, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;

    // Transform backend nodes to React Flow format
    const rfNodes = data.nodes.map((node, i) => {
      // Simple grid layout for demo (in a real app, use dagre or force layout)
      const cols = Math.ceil(Math.sqrt(data.nodes.length));
      const x = (i % cols) * 200;
      const y = Math.floor(i / cols) * 150;

      return {
        id: node.node_id,
        position: { x, y },
        data: { label: node.label },
        style: getNodeStyle(node.node_type, node.is_flagged),
      };
    });

    // Transform backend edges
    const rfEdges = data.edges.map((edge, i) => ({
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

    setNodes(rfNodes);
    setEdges(rfEdges);
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
