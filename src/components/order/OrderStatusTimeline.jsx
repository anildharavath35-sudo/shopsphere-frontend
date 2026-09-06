import { ORDER_FLOW, humanize } from '../common/OrderStatus';
import { CheckIcon, XIcon } from '../common/Icons';
import { formatDateTime } from '../../utils/currency';

export const OrderStatusTimeline = ({ order }) => {
  const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === 'cancelled';
  const history = order.statusHistory || [];

  const stepTime = (status) => {
    const h = history.find((x) => x.status === status);
    return h ? formatDateTime(h.at) : null;
  };

  // cancelled: show progression up to where it was cancelled, then a red node
  const steps = ORDER_FLOW.slice(0, Math.max(1, currentIndex + 1));

  return (
    <div>
      <div className="flex items-center">
        {cancelled ? (
          <div className="flex flex-1 items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-500 text-white">
                <XIcon size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Order Cancelled</p>
                <p className="text-xs text-slate-400">{stepTime('cancelled')}</p>
              </div>
            </div>
            {order.cancellationReason && (
              <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                {order.cancellationReason}
              </span>
            )}
          </div>
        ) : (
          <ol className="flex w-full items-center">
            {steps.map((status, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              const time = stepTime(status);
              return (
                <li key={status} className="relative flex flex-1 flex-col items-center text-center">
                  {/* connecting line */}
                  {i > 0 && (
                    <span
                      className={`absolute left-0 right-1/2 top-5 h-0.5 -translate-x-1/2 ${
                        done || active ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                      style={{ left: '-50%', right: '50%' }}
                    />
                  )}
                  <span
                    className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                      done || active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    {done ? <CheckIcon size={18} /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </span>
                  <p
                    className={`mt-2 text-[11px] font-semibold sm:text-xs ${
                      active ? 'text-brand-700 dark:text-brand-300' : done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {humanize(status)}
                  </p>
                  {time && <p className="hidden text-[10px] text-slate-400 sm:block">{time}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* status history list */}
      <div className="mt-6 space-y-3">
        {[...(history || [])].reverse().map((h, i) => (
          <div key={i} className="flex items-start gap-3 border-l-2 border-brand-100 pl-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{humanize(h.status)}</p>
              <p className="text-xs text-slate-400">{formatDateTime(h.at)}</p>
              {h.note && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{h.note}</p>}
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-slate-400">No updates yet.</p>}
      </div>
    </div>
  );
};