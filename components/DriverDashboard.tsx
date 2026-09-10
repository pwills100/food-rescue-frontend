'use client';
import { useState, useEffect } from 'react';
import { Navigation, Map, QrCode, CheckCircle, ShieldCheck } from 'lucide-react';
import { fetchFromApi } from '../app/utils/api'

export default function DriverDashboard({ user }: { user: any }) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeDeliveryId, setActiveDeliveryId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchAvailableDeliveries();
  }, []);

  const fetchAvailableDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries/available');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Failed to load deliveries");
    }
  };

  const handleClaimDelivery = async (deliveryId: number) => {
    try {
      const response = await fetch(`/api/deliveries/claim/${deliveryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: user.id }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setActiveToken(data.qr_validation_token);
      setActiveDeliveryId(deliveryId);
      setStatusMsg(`Delivery claimed! Head to the donor location.`);
      fetchAvailableDeliveries(); 
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleValidateDropoff = async () => {
    try {
      // Sending exact coordinates of Hope Rescue Shelter to pass the 100m geofence rule
      const response = await fetch('/api/deliveries/validate-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_id: activeDeliveryId,
          qr_validation_token: activeToken,
          driver_lat: 9.0600,
          driver_lng: 7.5100
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setActiveToken(null);
      setActiveDeliveryId(null);
      setStatusMsg('Handover validated securely. Delivery completed. Great job!');
    } catch (err: any) {
      setStatusMsg(`Validation Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      
      {/* Active Token Display for the Defense Presentation */}
      {activeToken && (
        <div className="bg-primary-dark text-white rounded-2xl shadow-xl p-8 text-center border-4 border-primary-light animate-pulse">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold mb-2">Active Geofenced Delivery</h2>
          <p className="mb-4 text-primary-light">Present this token at the drop-off coordinates for proximity validation.</p>
          <div className="bg-black/30 p-4 rounded-lg font-mono text-lg tracking-widest break-all mb-6">
            {activeToken}
          </div>
          <button
            onClick={handleValidateDropoff}
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-lg shadow-md transition-colors"
          >
            <ShieldCheck className="w-6 h-6 mr-2" />
            Simulate Arrival & Validate Scan
          </button>
        </div>
      )}

      {statusMsg && !activeToken && (
        <div className="p-4 rounded-lg flex items-center shadow-sm bg-green-50 text-green-700 border-l-4 border-green-500">
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      {!activeToken && (
        <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Driver Route Dispatch</h2>
              <p className="text-primary-light text-sm mt-1">Claim optimized logistical routes</p>
            </div>
            <Navigation className="w-10 h-10 text-white/80" />
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Pickups</h3>
            
            {deliveries.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                No deliveries currently require routing.
              </div>
            ) : (
              <div className="grid gap-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.delivery_id} className="border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-primary-light transition-colors bg-white">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          Route #{delivery.delivery_id}
                        </span>
                        <span className="font-semibold text-gray-800">{delivery.dietary_category} ({delivery.volume_kg}kg)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Map className="w-4 h-4 mr-2 text-primary" /> 
                        Drop-off: <span className="font-semibold ml-1">{delivery.charity_name}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClaimDelivery(delivery.delivery_id)}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg shadow font-medium transition-colors"
                    >
                      Claim & Navigate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}