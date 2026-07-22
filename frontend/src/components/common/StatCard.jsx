import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function StatCard({ title, value, icon: Icon, trend, colorClass }) {
  const { t } = useTranslation();
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className={cn('absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150', colorClass)} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={cn('p-3 rounded-xl bg-gray-800/50 border border-gray-700/50', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className={cn('font-medium', (trend.isPositive ?? trend.is_positive) ? 'text-emerald-400' : 'text-red-400')}>
            {(trend.isPositive ?? trend.is_positive) ? '↑' : '↓'} {trend.value}%
          </span>
          <span className="text-gray-500">{t('vs_last_week')}</span>
        </div>
      )}
    </div>
  );
}
