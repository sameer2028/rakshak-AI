import { Filter, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeatmapFilters({ filters, onChange }) {
  const { t } = useTranslation();
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-card p-4 border border-gray-700/50 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">{t('filters')}</span>
        </div>

        <select
          name="crimeType"
          value={filters.crimeType}
          onChange={handleChange}
          className="bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">{t('all_crime_types')}</option>
          <option value="upi_fraud">UPI Fraud</option>
          <option value="digital_arrest">{t('digital_arrest_type')}</option>
          <option value="phishing">{t('phishing')}</option>
          <option value="counterfeit">Counterfeit Currency</option>
        </select>

        <select
          name="state"
          value={filters.state}
          onChange={handleChange}
          className="bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">{t('all_states')}</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Telangana">Telangana</option>
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Calendar className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="pl-9 pr-3 py-2 bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="relative">
            <Calendar className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="pl-9 pr-3 py-2 bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
