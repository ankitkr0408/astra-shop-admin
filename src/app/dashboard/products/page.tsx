'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        images: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                images: [formData.images], // simple array wrap
                price: Number(formData.price),
                stock: Number(formData.stock)
            };

            if (editingId) {
                await api.put(`/products/${editingId}`, payload);
            } else {
                await api.post('/products', payload);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', price: '', category: '', description: '', stock: '', images: '' });
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product", error);
        }
    };

    const openEdit = (product: any) => {
        setEditingId(product._id);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.images[0] || ''
        });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', price: '', category: '', description: '', stock: '', images: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Product
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b border-gray-700 hover:bg-gray-750">
                                <td className="p-4">{product.name}</td>
                                <td className="p-4">₹{product.price}</td>
                                <td className="p-4">{product.category}</td>
                                <td className="p-4">{product.stock}</td>
                                <td className="p-4 flex space-x-2">
                                    <button onClick={() => openEdit(product)} className="text-blue-400 hover:text-blue-300">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 bg-gray-700 rounded"
                                required
                            />
                            <div className="flex space-x-4">
                                <input
                                    placeholder="Price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full p-2 bg-gray-700 rounded"
                                    required
                                />
                                <input
                                    placeholder="Stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full p-2 bg-gray-700 rounded"
                                    required
                                />
                            </div>
                            <input
                                placeholder="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-2 bg-gray-700 rounded"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 bg-gray-700 rounded"
                                required
                            />
                             <input
                                placeholder="Image URL"
                                value={formData.images}
                                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                className="w-full p-2 bg-gray-700 rounded"
                            />
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
