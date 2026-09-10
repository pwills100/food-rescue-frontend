'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard } from 'lucide-react';
import DonorDashboard from '../../components/DonorDashboard';
import DriverDashboard from '../../components/DriverDashboard';
import AdminDashboard from '../../components/AdminDashboard';


export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-surface border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-lg">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Dispatcher Portal</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs font-medium text-primary uppercase tracking-wider">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
<main className="p-6">
  {user.role === 'donor' && <DonorDashboard user={user} />}
  {user.role === 'admin' && <AdminDashboard user={user} />}
  {user.role === 'driver' && <DriverDashboard user={user} />}
</main>
    </div>
  );
}