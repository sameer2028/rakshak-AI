import { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Download, Users, Share2, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { toPng } from 'html-to-image';
import NetworkGraph from './NetworkGraph';
import GraphControls from './GraphControls';
import NodeDetail from './NodeDetail';
import CommunitiesPanel from './CommunitiesPanel';
import AnalysisResultPanel from './AnalysisResultPanel';
import { fraudNetworkApi } from '../../api/fraud-network.api';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../lib/utils';

export default function FraudNetworkPage() {
  const addToast = useToastStore((state) => state.addToast);
  
  // State
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({ communityId: null, nodeType: null });
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'communities'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const graphRef = useRef(null);

  // Load initial graph
  useEffect(() => {
    loadGraph();
  }, [activeFilters]); // Re-run when filters change

  const loadGraph = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const { communityId, nodeType } = activeFilters;
      const response = await fraudNetworkApi.getGraph(communityId, nodeType, 200); // Higher limit for better viz
      setGraphData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load fraud network data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = async (nodeId) => {
    try {
      const response = await fraudNetworkApi.getNode(nodeId);
      setSelectedNode(response.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load node details', 'error');
    }
  };

  const handleAnalyze = async (algorithm) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const response = await fraudNetworkApi.analyze({ algorithm });
      setAnalysisResult(response.data);
      loadGraph();
    } catch (err) {
      addToast('Analysis failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setActiveFilters({ communityId: null, nodeType: null });
      return;
    }
    
    setIsLoading(true);
    setSelectedNode(null);
    try {
      const response = await fraudNetworkApi.search({ query, limit: 50 });
      setGraphData(response.data);
    } catch (err) {
      addToast('Search failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsImage = useCallback(() => {
    if (graphRef.current === null) {
      return;
    }
    
    addToast('Exporting graph...', 'info');
    toPng(graphRef.current, { backgroundColor: '#111827', quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `fraud-network-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        addToast('Export successful', 'success');
      })
      .catch((err) => {
        console.error(err);
        addToast('Failed to export image', 'error');
      });
  }, [addToast]);

  return (
    <div className="min-h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-6rem)] flex flex-col space-y-4 animate-fade-in relative lg:overflow-hidden">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-purple-400" />
            Fraud Network Intelligence
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive visualization of crime rings, money mules, and suspect links.
          </p>
        </div>
        
        {/* Stats Summary Bar */}
        {graphData && (
          <div className="flex gap-3 overflow-x-auto pb-1 max-w-full">
            <div className="glass-card px-4 py-2 border border-purple-500/30 flex flex-col items-center">
              <span className="text-xl font-bold text-white">{graphData.total_nodes}</span>
              <span className="text-[10px] text-purple-300 uppercase tracking-wider">Nodes</span>
            </div>
            <div className="glass-card px-4 py-2 border border-blue-500/30 flex flex-col items-center">
              <span className="text-xl font-bold text-white">{graphData.total_edges}</span>
              <span className="text-[10px] text-blue-300 uppercase tracking-wider">Links</span>
            </div>
            <div className="glass-card px-4 py-2 border border-green-500/30 flex flex-col items-center">
              <span className="text-xl font-bold text-white">{graphData.communities_count}</span>
              <span className="text-[10px] text-green-300 uppercase tracking-wider">Syndicates</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm shrink-0">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 flex flex-col space-y-4 overflow-y-auto custom-scrollbar shrink-0">
          
          {/* Tabs */}
          <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-700/50">
            <button
              onClick={() => setActiveTab('controls')}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'controls' ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
              )}
            >
              <Cpu className="w-3.5 h-3.5" /> Controls
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'communities' ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-300"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Syndicates
            </button>
          </div>

          {activeTab === 'controls' ? (
            <GraphControls
              onAnalyze={handleAnalyze}
              onSearch={handleSearch}
              isLoading={isLoading}
              onFilterChange={setActiveFilters}
              activeFilters={activeFilters}
              communitiesCount={graphData?.communities_count || 0}
            />
          ) : (
            <CommunitiesPanel 
              onSelectCommunity={(cid) => setActiveFilters({ ...activeFilters, communityId: cid })}
            />
          )}

          {/* Export Action */}
          <button
            onClick={exportAsImage}
            className="w-full py-2.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Graph as PNG
          </button>

          {/* Legend */}
          <div className="glass-card p-4 border border-gray-700/50 mt-auto">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Legend
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-[#ef4444] bg-[#7f1d1d]" /> Suspect
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-[#3b82f6] bg-[#1e3a8a]" /> Victim
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[#374151] bg-[#1f2937]" /> Phone
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-[#8b5cf6] bg-[#4c1d95]" /> UPI ID
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-[#10b981] bg-[#065f46]" /> Bank Account
              </div>
              <div className="flex items-center gap-3 mt-4 pt-2 border-t border-gray-700/50">
                <div className="w-4 h-4 rounded border-2 border-[#ef4444] bg-gradient-to-br from-[#7f1d1d] to-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)] flex items-center justify-center text-[10px]">👑</div> Ring Leader
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border-2 border-dashed border-[#f59e0b] bg-[#78350f] flex items-center justify-center text-[10px]">💰</div> Money Mule
              </div>
            </div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="flex-1 relative rounded-xl border border-gray-700/50 bg-gray-900/30 overflow-hidden shadow-inner flex flex-col h-[500px] lg:h-auto lg:min-h-0">
          
          {isLoading && !graphData && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-purple-300 font-medium animate-pulse">Initializing Intelligence Grid...</p>
            </div>
          )}

          {(!graphData || graphData.nodes.length === 0) && !isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/30">
              <div className="w-24 h-24 mb-6 opacity-20 text-gray-400">
                <Network className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Network Data Found</h3>
              <p className="text-gray-500 text-sm max-w-sm text-center">
                Try adjusting your filters or search query to explore the fraud intelligence graph.
              </p>
              <button 
                onClick={() => setActiveFilters({ communityId: null, nodeType: null })}
                className="mt-6 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                Reset View
              </button>
            </div>
          )}

          {graphData && graphData.nodes.length > 0 && (
            <NetworkGraph 
              data={graphData} 
              onNodeClick={handleNodeClick} 
              graphRef={graphRef}
            />
          )}

          {/* Analysis Result Overlay */}
          {analysisResult && (
            <AnalysisResultPanel result={analysisResult} onClose={() => setAnalysisResult(null)} />
          )}

          {/* Node Detail Slide-over Panel */}
          {selectedNode && (
            <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
