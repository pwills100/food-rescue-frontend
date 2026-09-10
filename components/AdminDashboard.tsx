'use client';
import { useState, useEffect } from 'react';
import { Activity, MapPin, Zap, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ user }: { user: any }) {
  const [pendingBatches, setPendingBatches] = useState<any[]>([]);
  const [matchResult, setMatchResult] = useState<string | null>(null);

  // Fetch pending batches when the dashboard loads
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/batches/pending');
      const data = await response.json();
      setPendingBatches(data);
    } catch (error) {
      console.error("Failed to load batches");
    }
  };

  const handleRunAlgorithm = async (batchId: number) => {
    setMatchResult(null);
    try {
      // We pass mock GPS coordinates representing the Bakery's location
      const response = await fetch(`http://localhost:5000/api/batches/match/${batchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_lat: 9.0650, 
          pickup_lng: 7.5150
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMatchResult(`Success! Batch #${batchId} routed to ${data.charity_assigned.charity_name}.`);
      fetchBatches(); // Refresh the list to remove the matched batch
    } catch (err: any) {
      setMatchResult(`Match Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">
      
      {matchResult && (
        <div className={`p-4 rounded-lg flex items-center shadow-sm ${matchResult.includes('Failed') ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
          <AlertCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">{matchResult}</span>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Global Dispatch Center</h2>
            <p className="text-primary-light text-sm mt-1">Monitor donations and trigger spatial matching</p>
          </div>
          <Activity className="w-10 h-10 text-white/80" />
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Rescues</h3>
          
          {pendingBatches.length === 0 ? (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
              No pending food batches. The network is clear.
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingBatches.map((batch) => (
                <div key={batch.batch_id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-primary-light transition-colors bg-white">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Batch #{batch.batch_id}
                      </span>
                      <span className="font-semibold text-gray-800">{batch.dietary_category}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {batch.volume_kg} kg</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRunAlgorithm(batch.batch_id)}
                    className="flex items-center bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg shadow font-medium transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Run Spatial Match
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}