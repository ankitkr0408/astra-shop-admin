'use client'

import { useState, useEffect } from 'react'
import api from '@/utils/api'
import { CheckCircle, XCircle, Truck, Eye, Download, ShoppingCart } from 'lucide-react'
import type { Order } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get<Order[]>('/orders')
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeliver = async (id: string) => {
    if (!confirm('Mark this order as delivered?')) return
    
    try {
      await api.put(`/orders/${id}/deliver`)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update delivery status:', error)
      alert('Failed to update delivery status')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'paid') return order.isPaid && !order.isDelivered
    if (filter === 'pending') return !order.isPaid
    if (filter === 'delivered') return order.isDelivered
    return true
  })

  const getStatusCounts = () => {
    const paid = orders.filter(o => o.isPaid && !o.isDelivered).length
    const pending = orders.filter(o => !o.isPaid).length
    const delivered = orders.filter(o => o.isDelivered).length
    return { paid, pending, delivered, total: orders.length }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`bg-white p-4 rounded-lg shadow cursor-pointer ${filter === 'all' ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="text-2xl font-bold">{statusCounts.total}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div 
          className={`bg-yellow-50 p-4 rounded-lg shadow cursor-pointer ${filter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
          <div className="text-sm text-yellow-600">Pending Payment</div>
        </div>
        <div 
          className={`bg-blue-50 p-4 rounded-lg shadow cursor-pointer ${filter === 'paid' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFilter('paid')}
        >
          <div className="text-2xl font-bold text-blue-700">{statusCounts.paid}</div>
          <div className="text-sm text-blue-600">Processing</div>
        </div>
        <div 
          className={`bg-green-50 p-4 rounded-lg shadow cursor-pointer ${filter === 'delivered' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          <div className="text-2xl font-bold text-green-700">{statusCounts.delivered}</div>
          <div className="text-sm text-green-600">Delivered</div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'No orders in your store yet.' : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof order.user === 'object' ? order.user.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ₹{order.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isPaid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isDelivered ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-5 w-5" />
                        </button>
                        {!order.isDelivered && order.isPaid && (
                          <button
                            onClick={() => handleDeliver(order._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Truck className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}