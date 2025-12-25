'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });

    useEffect(() => {
        // Fetch real stats here. For now, fetching counts individually.
        const fetchData = async () => {
            try {
                // In a real app we'd have a specific stats endpoint or calculate on backend
                const { data: products } = await api.get('/products');
                const { data: orders } = await api.get('/orders');
                const { data: users } = await api.get('/auth/users');

                const revenue = orders.reduce((acc: any, order: any) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalUsers: users.length
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                    <div className="p-4 bg-purple-600 rounded-full bg-opacity-20 text-purple-500">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                     <div className="p-4 bg-blue-600 rounded-full bg-opacity-20 text-blue-500">
                        <ShoppingCart size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400">Orders</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                     <div className="p-4 bg-green-600 rounded-full bg-opacity-20 text-green-500">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400">Products</p>
                        <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                     <div className="p-4 bg-yellow-600 rounded-full bg-opacity-20 text-yellow-500">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400">Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                </div>
            </div>
            {/* Recent activity charts could go here */}
        </div>
    );
}
