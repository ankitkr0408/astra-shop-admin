'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { CheckCircle, XCircle, Truck } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };

    const handleDeliver = async (id: string) => {
        try {
            await api.put(`/orders/${id}/deliver`);
            fetchOrders();
        } catch (error) {
            console.error("Failed into update delivery status", error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Orders</h1>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Paid</th>
                            <th className="p-4">Delivered</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-750">
                                <td className="p-4 text-xs font-mono">{order._id}</td>
                                <td className="p-4">{order.user?.name}</td>
                                <td className="p-4">{order.createdAt.substring(0, 10)}</td>
                                <td className="p-4">₹{order.totalPrice}</td>
                                <td className="p-4">
                                    {order.isPaid ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                                </td>
                                <td className="p-4">
                                    {order.isDelivered ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                                </td>
                                <td className="p-4">
                                    {!order.isDelivered && (
                                        <button onClick={() => handleDeliver(order._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center">
                                            <Truck className="w-4 h-4 mr-1" /> Mark Delivered
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
