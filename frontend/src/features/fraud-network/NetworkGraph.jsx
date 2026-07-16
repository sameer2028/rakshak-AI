import { useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Community colors - distinct hues for each community
const COMMUNITY_COLORS = [
  { bg: '#7f1d1d', border: '#ef4444', glow: 'rgba(239,68,68,0.4)' },   // Red
  { bg: '#1e3a8a', border: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },   // Blue
  { bg: '#4c1d95', border: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },   // Purple
  { bg: '#065f46', border: '#10b981', glow: 'rgba(16,185,129,0.4)' },   // Green
  { bg: '#78350f', border: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },   // Amber
  { bg: '#831843', border: '#ec4899', glow: 'rgba(236,72,153,0.4)' },   // Pink
  { bg: '#0c4a6e', border: '#0ea5e9', glow: 'rgba(14,165,233,0.4)' },   // Sky
  { bg: '#713f12', border: '#eab308', glow: 'rgba(234,179,8,0.4)' },    // Yellow
];

const getNodeStyle = (node) => {
  const type = node.node_type;
  const metrics = node.metrics || {};
  const communityId = metrics.community_id;
  const isRingLeader = metrics.is_ring_leader;
  const isMoneyMule = metrics.is_money_mule;
  const riskScore = metrics.risk_score || 0;

  // Get community color
  const commColor = communityId != null
    ? COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length]
    : { bg: '#1f2937', border: '#374151', glow: 'none' };

  const baseStyle = {
    padding: '10px 16px',
    borderRadius: type === 'phone' ? '20px' : '10px',
    fontSize: '12px',
    fontWeight: 600,
    border: `2px solid ${commColor.border}`,
    color: '#fff',
    background: commColor.bg,
    transition: 'all 0.3s ease',
  };

  // Ring leader - pulsing glow
  if (isRingLeader) {
    baseStyle.boxShadow = `0 0 20px ${commColor.glow}, 0 0 40px ${commColor.glow}`;
    baseStyle.border = `2px solid #ef4444`;
    baseStyle.background = `linear-gradient(135deg, ${commColor.bg}, #7f1d1d)`;
  }

  // Money mule - dashed border
  if (isMoneyMule) {
    baseStyle.borderStyle = 'dashed';
    baseStyle.borderWidth = '2px';
    baseStyle.borderColor = '#f59e0b';
  }

  // High risk nodes get subtle red tint
  if (riskScore >= 80) {
    baseStyle.boxShadow = (baseStyle.boxShadow || '') + `, 0 0 15px rgba(239,68,68,0.3)`;
  }

  // Type-specific icon prefix in label
  let prefix = '';
  switch (type) {
    case 'suspect': prefix = '🔴 '; break;
    case 'victim': prefix = '🔵 '; break;
    case 'phone': prefix = '📱 '; break;
    case 'upi': prefix = '💳 '; break;
    case 'bank_account':
    case 'account': prefix = '🏦 '; break;
    case 'device': prefix = '📟 '; break;
    default: break;
  }

  return { style: baseStyle, prefix };
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - 80,
      y: nodeWithPosition.y - 25,
    };
  });

  return { nodes, edges };
};

function FitViewUpdater({ nodes }) {
  const { fitView } = useReactFlow();
  
  useEffect(() => {
    if (nodes.length > 0) {
      // Wait for ReactFlow to render the newly positioned nodes
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 50);
    }
  }, [nodes, fitView]);
  
  return null;
}

export default function NetworkGraph({ data, onNodeClick, graphRef }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data || !data.nodes) return;

    const initialNodes = data.nodes.map((node) => {
      const { style, prefix } = getNodeStyle(node);
      const metrics = node.metrics || {};
      const badges = [];
      if (metrics.is_ring_leader) badges.push('👑');
      if (metrics.is_money_mule) badges.push('💰');

      return {
        id: node.node_id,
        position: { x: 0, y: 0 },
        data: {
          label: `${prefix}${badges.join('')}${badges.length ? ' ' : ''}${
            node.node_type === 'phone' ? node.properties?.phone_number || node.label :
            node.node_type === 'upi' ? node.properties?.upi_id || node.label :
            node.node_type === 'bank_account' ? node.properties?.bank_account || node.label :
            node.label
          }`,
          raw: node,
        },
        style,
      };
    });

    const initialEdges = data.edges.map((edge, i) => {
      const isHighWeight = edge.weight > 0.8;
      const edgeLabel = edge.edge_type.replace(/_/g, ' ');

      return {
        id: `e-${edge.source}-${edge.target}-${i}`,
        source: edge.source,
        target: edge.target,
        label: edgeLabel,
        type: 'smoothstep',
        animated: isHighWeight,
        style: {
          stroke: isHighWeight ? '#ef4444' : '#4b5563',
          strokeWidth: isHighWeight ? 2.5 : 1.5,
          opacity: 0.8,
        },
        labelStyle: { fill: '#9ca3af', fontWeight: 500, fontSize: '10px' },
        labelBgStyle: { fill: '#111827', fillOpacity: 0.9 },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighWeight ? '#ef4444' : '#4b5563',
          width: 15,
          height: 15,
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  const handleNodeClick = useCallback((_, node) => {
    onNodeClick(node.data?.raw?.node_id || node.id);
  }, [onNodeClick]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden bg-gray-900/50" ref={graphRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
        className="dark"
        minZoom={0.1}
        maxZoom={2}
      >
        <FitViewUpdater nodes={nodes} />
        <Background color="#1f2937" gap={20} size={1} />
        <Controls
          className="bg-gray-800 border-gray-700 fill-white [&>button]:bg-gray-800 [&>button]:border-gray-700 [&>button]:text-gray-300 [&>button:hover]:bg-gray-700"
        />
        <MiniMap
          nodeColor={(n) => n.style?.borderColor || n.style?.background || '#374151'}
          maskColor="rgba(17, 24, 39, 0.8)"
          className="bg-gray-900 border border-gray-700 rounded-lg"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
