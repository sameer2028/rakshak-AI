import { AlertTriangle, Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AlertBanner({ type = 'info', title, message, action }) {
  const types = {
    critical: {
      icon: ShieldAlert,
      wrapper: 'bg-red-500/10 border-red-500/30',
      title: 'text-red-400',
      text: 'text-red-300',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      wrapper: 'bg-amber-500/10 border-amber-500/30',
      title: 'text-amber-400',
      text: 'text-amber-300',
      iconColor: 'text-amber-400',
    },
    success: {
      icon: ShieldCheck,
      wrapper: 'bg-emerald-500/10 border-emerald-500/30',
      title: 'text-emerald-400',
      text: 'text-emerald-300',
      iconColor: 'text-emerald-400',
    },
    info: {
      icon: Info,
      wrapper: 'bg-blue-500/10 border-blue-500/30',
      title: 'text-blue-400',
      text: 'text-blue-300',
      iconColor: 'text-blue-400',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={cn('p-4 border rounded-lg flex items-start gap-4', config.wrapper)}>
      <div className={cn('p-2 rounded-full bg-black/20', config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className={cn('text-sm font-semibold mb-1', config.title)}>{title}</h4>
        <p className={cn('text-sm', config.text)}>{message}</p>
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
