'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    router.push('/login');
  };

  if (loading) return <div className="text-white bg-gray-900 min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col border-r border-gray-700">
        <div className="p-6 text-2xl font-bold tracking-wide text-purple-500">Astrabite Admin</div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/dashboard/products" className="flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded transition">
            <Package className="w-5 h-5 mr-3" /> Products
          </Link>
          <Link href="/dashboard/orders" className="flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded transition">
            <ShoppingCart className="w-5 h-5 mr-3" /> Orders
          </Link>
          <Link href="/dashboard/users" className="flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded transition">
            <Users className="w-5 h-5 mr-3" /> Users
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-400 hover:bg-gray-700 rounded transition">
                <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
