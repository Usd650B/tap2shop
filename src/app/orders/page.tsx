'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, User, MapPin, Calendar, CheckCircle, Clock, XCircle, Truck, Phone, Mail } from 'lucide-react'

interface Order {
  id: string
  product_id: string
  customer_name: string
  customer_contact: string
  delivery_address: string
  delivery_location: string
  quantity: number
  note?: string
  status: 'Pending' | 'Accepted' | 'Delivered' | 'Received' | 'Completed' | 'Rejected'
  created_at: string
  updated_at: string
  delivered_at?: string
  received_at?: string
  product: {
    id: string
    name: string
    price: number
    description?: string
    image_url?: string
    shop: {
      id: string
      name: string
      slug: string
    }
  }
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No authenticated user found')
        return
      }

      // First get the seller's shop
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!shop) {
        console.error('No shop found for user')
        setLoading(false)
        return
      }

      // Then get all products for this shop
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('shop_id', shop.id)

      if (!products || products.length === 0) {
        setOrders([])
        setLoading(false)
        return
      }

      const productIds = products.map(p => p.id)

      // Get all orders for these products
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (
            id,
            name,
            price,
            description,
            image_url,
            shop:shops!inner (
              id,
              name,
              slug
            )
          )
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        setOrders(ordersData || [])
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          ...(newStatus === 'Delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        alert('Failed to update order status. Please try again.')
      } else {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, ...(newStatus === 'Delivered' && { delivered_at: new Date().toISOString() }) } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Delivered': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Received': return 'bg-green-100 text-green-800 border-green-200'
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'Accepted': return <Truck className="w-4 h-4" />
      case 'Delivered': return <Package className="w-4 h-4" />
      case 'Received': return <CheckCircle className="w-4 h-4" />
      case 'Completed': return <CheckCircle className="w-4 h-4" />
      case 'Rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading your orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Manage and track customer orders for your products</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending', label: 'Pending', count: orders.filter(o => o.status.toLowerCase() === 'pending').length },
              { key: 'accepted', label: 'Accepted', count: orders.filter(o => o.status.toLowerCase() === 'accepted').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status.toLowerCase() === 'delivered').length },
              { key: 'received', label: 'Received', count: orders.filter(o => o.status.toLowerCase() === 'received').length },
              { key: 'completed', label: 'Completed', count: orders.filter(o => o.status.toLowerCase() === 'completed').length },
              { key: 'rejected', label: 'Rejected', count: orders.filter(o => o.status.toLowerCase() === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't received any orders yet."
                : `No ${filter} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      {order.status.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Accepted')}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status.toLowerCase() === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status.toLowerCase() === 'delivered' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Waiting for confirmation
                        </span>
                      )}
                      {order.status.toLowerCase() === 'received' && (
                        <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                          Order completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info with Image */}
                  <div className="flex space-x-4 mb-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {order.product.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt={order.product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{order.product.name}</h3>
                      {order.product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {order.product.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Quantity: {order.quantity}</span>
                        <span>Price: TZS {order.product.price}</span>
                        <span className="font-semibold text-indigo-600">
                          Total: TZS {(order.product.price * order.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Customer:</span>
                        <span className="text-gray-700">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Contact:</span>
                        <span className="text-gray-700">{order.customer_contact}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Delivery:</span>
                        <span className="text-gray-700">{order.delivery_address}</span>
                      </div>
                      {order.delivery_location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">Location:</span>
                          <span className="text-gray-700">{order.delivery_location}</span>
                        </div>
                      )}
                    </div>
                    
                    {order.note && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Customer Note:</p>
                        <p className="text-sm text-gray-700">{order.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
