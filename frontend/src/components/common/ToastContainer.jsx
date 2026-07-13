import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border w-80 animate-slide-up',
            {
              'bg-emerald-900/90 border-emerald-500/50 text-emerald-100': toast.type === 'success',
              'bg-red-900/90 border-red-500/50 text-red-100': toast.type === 'error',
              'bg-blue-900/90 border-blue-500/50 text-blue-100': toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
