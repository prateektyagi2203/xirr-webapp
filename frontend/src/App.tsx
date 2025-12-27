import { useState } from 'react';
import { Plus, Trash2, Calculator, TrendingUp } from 'lucide-react';

interface Cashflow {
  id: string;
  date: string;
  amount: string;
}

function App() {
  const [cashflows, setCashflows] = useState<Cashflow[]>([
    { id: crypto.randomUUID(), date: '', amount: '' },
    { id: crypto.randomUUID(), date: '', amount: '' },
  ]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addRow = () => {
    setCashflows([...cashflows, { id: crypto.randomUUID(), date: '', amount: '' }]);
  };

  const deleteRow = (id: string) => {
    if (cashflows.length > 1) {
      setCashflows(cashflows.filter(cf => cf.id !== id));
    }
  };

  const updateCashflow = (id: string, field: 'date' | 'amount', value: string) => {
    setCashflows(cashflows.map(cf =>
      cf.id === id ? { ...cf, [field]: value } : cf
    ));
  };

  const calculateXIRR = async () => {
    setError(null);
    setResult(null);

    const validCashflows = cashflows.filter(cf => cf.date && cf.amount);

    if (validCashflows.length < 2) {
      setError('Please enter at least 2 cash flows with valid dates and amounts.');
      return;
    }

    const payload = {
      cashflows: validCashflows.map(cf => ({
        date: cf.date,
        amount: parseFloat(cf.amount)
      }))
    };

    setLoading(true);

    try {
      const response = await fetch('https://xirr-backend.onrender.com/xirr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate XIRR');
      }

      setResult(data.xirr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating XIRR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">XIRR Calculator</h1>
          <p className="text-gray-600">Calculate your Extended Internal Rate of Return</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cash Flows</h2>
            <p className="text-sm text-gray-600 mb-4">All payout amounts should be recorded with a minus (–) sign, while all pay-in amounts should be recorded as positive values</p>
            <div className="space-y-3">
              {cashflows.map((cashflow, index) => (
                <div key={cashflow.id} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={cashflow.date}
                        onChange={(e) => updateCashflow(cashflow.id, 'date', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={cashflow.amount}
                        onChange={(e) => updateCashflow(cashflow.id, 'amount', e.target.value)}
                        placeholder="Enter amount"
                        step="0.01"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRow(cashflow.id)}
                    disabled={cashflows.length === 1}
                    className="mt-7 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete row"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addRow}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Row
            </button>
            <button
              onClick={calculateXIRR}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-5 h-5" />
              {loading ? 'Calculating...' : 'Calculate XIRR'}
            </button>
          </div>
        </div>

        {(result !== null || error) && (
          <div className={`rounded-2xl shadow-xl p-8 ${
            error
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'
              : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'
          }`}>
            <div className="text-center">
              {error ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">XIRR Result</h3>
                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                    {result.toFixed(2)}%
                  </div>
                  <p className="text-gray-600">Annual return rate</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Enter your investment dates and amounts to calculate the Extended Internal Rate of Return</p>
        </div>
      </div>
    </div>
  );
}

export default App;
