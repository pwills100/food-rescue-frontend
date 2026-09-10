'use client';
import { useState } from 'react';
import { Package, Clock, Scale, CheckCircle } from 'lucide-react';
import { fetchFromApi } from '../app/utils/api'
export default function DonorDashboard({ user }: { user: any }) {
  const [category, setCategory] = useState('');
  const [volume, setVolume] = useState('');
  const [spoilageTime, setSpoilageTime] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg('');

    try {
      const response = await fetch('/api/batches/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: user.id,
          dietary_category: category,
          volume_kg: parseFloat(volume),
          estimated_spoilage_time: spoilageTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setStatusMsg('Food batch logged successfully! Awaiting algorithmic match.');
      setCategory('');
      setVolume('');
      setSpoilageTime('');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Log Surplus Food Batch</h2>
            <p className="text-primary-light text-sm mt-1">Enter perishable details for dynamic routing</p>
          </div>
          <Package className="w-10 h-10 text-white/80" />
        </div>

        <div className="p-8">
          {statusMsg && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${statusMsg.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{statusMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogBatch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dietary Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="">Select Category...</option>
                  <option value="Baked Goods">Baked Goods</option>
                  <option value="Produce">Produce (Fruits/Veg)</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Dairy">Dairy</option>
                </select>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume (kg)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. 15.5"
                  />
                </div>
              </div>
            </div>

            {/* Spoilage Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Spoilage Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={spoilageTime}
                  onChange={(e) => setSpoilageTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">This timestamp is strictly utilized by the Dynamic Decay Scoring algorithm.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-md transition-colors disabled:opacity-70 mt-4"
            >
              {isLoading ? 'Logging Batch...' : 'Submit Batch to Dispatcher'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}