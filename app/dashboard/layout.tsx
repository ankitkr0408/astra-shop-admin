'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')

    if (isAuthenticated !== 'true') {
      router.replace('/login') // 👈 IMPORTANT
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Astrabite Admin</h1>
              <div className="ml-10 flex space-x-4">
                <a href="/dashboard" className="px-3 py-2 rounded-md text-sm bg-gray-900">Dashboard</a>
                <a href="/dashboard/products" className="px-3 py-2 rounded-md text-sm hover:bg-gray-700">Products</a>
                <a href="/dashboard/orders" className="px-3 py-2 rounded-md text-sm hover:bg-gray-700">Orders</a>
                <a href="/dashboard/users" className="px-3 py-2 rounded-md text-sm hover:bg-gray-700">Users</a>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}
