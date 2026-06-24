import { Network, Link } from 'lucide-react';

export default function FraudRingSummary({ data }) {
  // We'll mock this data based on the API response or use it if available
  // It assumes `data.top_communities` or similar structure exists
  
  const communities = data?.top_communities || [
    { id: 'C-42', nodes: 15, risk: 95, main_type: 'Digital Arrest' },
    { id: 'C-18', nodes: 8, risk: 88, main_type: 'UPI Fraud' },
    { id: 'C-05', nodes: 6, risk: 75, main_type: 'Phishing' }
  ];

  return (
    <div className="glass-card h-full border border-gray-700/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-400" />
          Top Fraud Rings Detected
        </h3>
        <Link className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
      </div>

      <div className="p-4 space-y-4 flex-1">
        {communities.map((ring, idx) => (
          <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Ring {ring.id}
              </span>
              <span className="text-xs text-red-400 font-bold">Risk: {ring.risk}%</span>
            </div>
            
            <div className="flex justify-between items-end text-sm mt-3">
              <div>
                <p className="text-gray-400 text-xs">Primary Activity</p>
                <p className="text-gray-200 font-medium">{ring.main_type}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Members</p>
                <p className="text-gray-200 font-mono font-medium">{ring.nodes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
