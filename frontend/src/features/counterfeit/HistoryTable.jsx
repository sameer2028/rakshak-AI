import { useState } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, Calendar, RefreshCw } from 'lucide-react';

/**
 * HistoryTable — paginated table of past CC verification records.
 *
 * Features:
 *   - Search by filename or serial number
 *   - Filter by denomination and verdict
 *   - Refresh button
 *   - Genuine / Counterfeit status badges
 *
 * Props:
 *   history    — array of CCHistoryItem objects from /api/cc/history
 *   onRefresh  — callback to re-fetch history
 */
export default function HistoryTable({ history, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [denomFilter, setDenomFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ocr_serial_number &&
        item.ocr_serial_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDenom =
      denomFilter === 'all' || item.denomination.toString() === denomFilter;

    const matchesVerdict =
      verdictFilter === 'all' ||
      (verdictFilter === 'genuine' && item.is_genuine) ||
      (verdictFilter === 'fake' && !item.is_genuine);

    return matchesSearch && matchesDenom && matchesVerdict;
  });

  return (
    <div className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
          Verification History Logs
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-cyan-400 border border-transparent hover:border-gray-700 transition-all cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw size={14} />
          </button>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 items-center shrink-0 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search filename / serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              <select
                value={denomFilter}
                onChange={(e) => setDenomFilter(e.target.value)}
                className="pl-8 pr-6 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Denoms</option>
                <option value="10">₹10</option>
                <option value="20">₹20</option>
                <option value="50">₹50</option>
                <option value="100">₹100</option>
                <option value="200">₹200</option>
                <option value="500">₹500</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                className="pl-8 pr-6 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Verdicts</option>
                <option value="genuine">Genuine Only</option>
                <option value="fake">Fake Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-xl bg-black/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/40 text-xs uppercase tracking-wider font-bold text-gray-400">
              <th className="py-3.5 px-4">Date / Time</th>
              <th className="py-3.5 px-4">File Source</th>
              <th className="py-3.5 px-4 text-center">Denomination</th>
              <th className="py-3.5 px-4">Serial Number</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4 text-center">Verdict</th>
              <th className="py-3.5 px-4">Anomalies Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900 text-xs">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/25 transition-all text-gray-300">
                  {/* Timestamp */}
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </td>

                  {/* Filename — strip UUID prefix */}
                  <td className="py-3 px-4 font-medium truncate max-w-[140px]" title={item.filename}>
                    {item.filename.split('_').slice(1).join('_') || item.filename}
                  </td>

                  {/* Denomination */}
                  <td className="py-3 px-4 text-center font-bold text-cyan-400">
                    ₹{item.denomination}
                  </td>

                  {/* Serial Number */}
                  <td className="py-3 px-4 font-mono font-semibold">
                    {item.ocr_serial_number || (
                      <span className="text-gray-600 font-normal">Unreadable</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4 font-semibold">{item.confidence}%</td>

                  {/* Verdict badge */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {item.is_genuine ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                        <ShieldCheck size={11} />
                        GENUINE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                        <ShieldAlert size={11} />
                        COUNTERFEIT
                      </span>
                    )}
                  </td>

                  {/* Failed features */}
                  <td className="py-3 px-4">
                    {item.features_failed.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.features_failed.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-red-950/20 border border-red-900/40 text-red-300 rounded font-semibold truncate max-w-[120px]"
                            title={feat}
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">None (Passed)</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                  No verification records found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
