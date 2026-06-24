import { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import NetworkGraph from './NetworkGraph';
import GraphControls from './GraphControls';
import NodeDetail from './NodeDetail';
import { fraudNetworkApi } from '../../api/fraud-network.api';

export default function FraudNetworkPage() {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial graph
  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const response = await fraudNetworkApi.getGraph();
      setGraphData(response.data);
    } catch (err) {
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
    }
  };

  const handleAnalyze = async (algorithm) => {
    setIsLoading(true);
    try {
      const response = await fraudNetworkApi.analyze({ algorithm });
      alert(`Analysis complete: ${response.data.message}`);
      loadGraph(); // reload graph with updated metrics
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return loadGraph();
    setIsLoading(true);
    try {
      const response = await fraudNetworkApi.search({ query });
      setGraphData(response.data);
    } catch (err) {
      alert('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 animate-fade-in relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-purple-400" />
            Fraud Network Intelligence
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive visualization of crime rings, money mules, and suspect links.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        <div className="lg:col-span-1 space-y-4">
          <GraphControls 
            onAnalyze={handleAnalyze} 
            onSearch={handleSearch} 
            isLoading={isLoading} 
          />
          
          <div className="glass-card p-4 border border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legend</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#7f1d1d] border border-[#ef4444]" /> Suspect</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#1e3a8a] border border-[#3b82f6]" /> Victim</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1f2937] border border-gray-500" /> Phone</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#4c1d95] border border-[#8b5cf6]" /> UPI ID</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#064e3b] border border-[#10b981]" /> Bank Account</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative rounded-xl border border-gray-700/50 bg-gray-900/30">
          {graphData ? (
            <NetworkGraph data={graphData} onNodeClick={handleNodeClick} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading graph data...
            </div>
          )}
          
          {selectedNode && (
            <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
