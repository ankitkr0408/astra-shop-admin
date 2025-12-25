'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Trash2, ShieldCheck, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
             console.error("Failed to fetch users", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
             try {
                await api.delete(`/auth/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user", error);
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                     <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Admin</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {users.map((user) => (
                            <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750">
                                <td className="p-4 text-xs font-mono">{user._id}</td>
                                <td className="p-4">{user.name}</td>
                                <td className="p-4"><a href={`mailto:${user.email}`} className="text-blue-400">{user.email}</a></td>
                                <td className="p-4">
                                     {user.isAdmin ? (
                                        <span className="flex items-center text-green-400"><ShieldCheck className="w-4 h-4 mr-1"/> Admin</span>
                                     ) : (
                                         <span className="flex items-center text-gray-400"><Shield className="w-4 h-4 mr-1"/> User</span>
                                     )}
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(user._id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
