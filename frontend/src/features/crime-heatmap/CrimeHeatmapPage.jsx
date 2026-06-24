import { useState, useEffect } from 'react';
import { Map, Loader2 } from 'lucide-react';
import HeatmapView from './HeatmapView';
import HeatmapFilters from './HeatmapFilters';
import DistrictRiskPanel from './DistrictRiskPanel';
import { crimeHeatmapApi } from '../../api/crime-heatmap.api';

export default function CrimeHeatmapPage() {
  const [points, setPoints] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    crimeType: '',
    state: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pointsRes, districtsRes] = await Promise.all([
        crimeHeatmapApi.getPoints(filters),
        crimeHeatmapApi.getDistricts(filters.state, 'high') // load high/critical
      ]);
      
      setPoints(pointsRes.data.points);
      
      // Filter critical and high risk locally if backend returns all
      const highRisk = districtsRes.data.districts.filter(d => ['critical', 'high'].includes(d.risk_level));
      setDistricts(highRisk);
      
    } catch (err) {
      setError('Failed to load heatmap data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in relative">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-blue-500" />
            Crime Density Heatmap
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Geospatial intelligence of cybercrime hotspots across India.
          </p>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating Map...
          </div>
        )}
      </div>

      <HeatmapFilters filters={filters} onChange={setFilters} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        <div className="lg:col-span-3 h-full">
          <HeatmapView points={points} />
        </div>
        <div className="lg:col-span-1 h-full">
          <DistrictRiskPanel districts={districts} isLoading={isLoading && districts.length === 0} />
        </div>
      </div>
    </div>
  );
}
