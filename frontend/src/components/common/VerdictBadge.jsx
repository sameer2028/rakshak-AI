import { cn, getVerdictClasses } from '../../lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function VerdictBadge({ verdict, className }) {
  const badgeClass = getVerdictClasses(verdict);
  
  let Icon = ShieldAlert;
  if (verdict === 'SAFE' || verdict === 'GENUINE') Icon = ShieldCheck;
  if (verdict === 'SUSPICIOUS') Icon = Shield;

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', badgeClass, className)}>
      <Icon className="w-3.5 h-3.5" />
      {verdict}
    </div>
  );
}
