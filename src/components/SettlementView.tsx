import React, { useState } from 'react';
import { ShoppingItemRequest, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';
import { Copy, Check, CheckCircle2, Circle, Users } from 'lucide-react';

interface SettlementViewProps {
  requests: ShoppingItemRequest[];
  selectedCurrency: CurrencyCode;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  requests,
  selectedCurrency,
}) => {
  const [settledRequesters, setSettledRequesters] = useState<Record<string, boolean>>({});
  const [copiedPerson, setCopiedPerson] = useState<string | null>(null);

  // Group by requester
  const grouped = React.useMemo(() => {
    const map: Record<
      string,
      {
        requesterName: string;
        items: ShoppingItemRequest[];
        totalUnits: number;
        totalJpy: number;
      }
    > = {};

    requests.forEach((req) => {
      const name = req.requesterName;
      if (!map[name]) {
        map[name] = {
          requesterName: name,
          items: [],
          totalUnits: 0,
          totalJpy: 0,
        };
      }
      map[name].items.push(req);
      map[name].totalUnits += req.quantity;
      map[name].totalJpy += (req.estimatedPriceJpy || 0) * req.quantity;
    });

    return Object.values(map).sort((a, b) => b.totalUnits - a.totalUnits);
  }, [requests]);

  const toggleSettled = (name: string) => {
    setSettledRequesters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const copyPersonReceipt = (data: (typeof grouped)[0]) => {
    let msg = `🇯🇵 Japan Souvenirs for ${data.requesterName}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    data.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.productName}\n`;
      msg += `   Qty: ${item.quantity}x\n`;
      if (item.notes) {
        msg += `   Remarks: ${item.notes}\n`;
      }
      if (item.estimatedPriceJpy > 0) {
        msg += `   Est: ¥${(item.estimatedPriceJpy * item.quantity).toLocaleString()} JPY\n`;
      }
    });
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Total Units: ${data.totalUnits} pcs\n`;
    if (data.totalJpy > 0) {
      msg += `Total: ¥${data.totalJpy.toLocaleString()} JPY (~${formatCurrency(data.totalJpy, selectedCurrency)})\n`;
    }
    msg += `Arigatou gozaimasu! 🙏`;

    navigator.clipboard.writeText(msg);
    setCopiedPerson(data.requesterName);
    setTimeout(() => setCopiedPerson(null), 2500);
  };

  const grandTotalJpy = grouped.reduce((sum, g) => sum + g.totalJpy, 0);

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Requesters Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          When people submit shopping requests, their individual breakdown and shareable reimbursement summaries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Requester Summary & Reimbursement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual item breakdown per friend with 1-click WhatsApp message receipts
          </p>
        </div>

        {grandTotalJpy > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
              Grand Total
            </span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              ¥{grandTotalJpy.toLocaleString()}{' '}
              <span className="text-xs text-slate-500 font-normal">
                ({formatCurrency(grandTotalJpy, selectedCurrency)})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Grid of Persons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {grouped.map((person) => {
          const isSettled = !!settledRequesters[person.requesterName];
          const isCopied = copiedPerson === person.requesterName;

          return (
            <div
              key={person.requesterName}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                isSettled
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Person Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {person.requesterName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {person.requesterName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {person.items.length} unique items · {person.totalUnits} total units
                      </p>
                    </div>
                  </div>

                  {person.totalJpy > 0 && (
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900 tabular-nums">
                        ¥{person.totalJpy.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold tabular-nums">
                        {formatCurrency(person.totalJpy, selectedCurrency)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items requested by this person */}
                <div className="py-3 space-y-2 text-xs">
                  {person.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-slate-700 bg-slate-50/80 px-3 py-2 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                          <span className="font-bold text-rose-600 font-mono text-xs">
                            {item.quantity}x
                          </span>
                          <span className="truncate font-medium">{item.productName}</span>
                        </div>
                        {item.estimatedPriceJpy > 0 && (
                          <span className="font-mono text-slate-600 shrink-0 tabular-nums">
                            ¥{(item.estimatedPriceJpy * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 pl-6">
                          Remarks: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleSettled(person.requesterName)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSettled
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isSettled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Settled</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark as Settled</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => copyPersonReceipt(person)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isCopied
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Copy formatted summary message for WhatsApp / LINE"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Summary!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy WhatsApp Summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
