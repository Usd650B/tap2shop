'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin, User, Phone, Calendar, Search, Filter } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

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

function YourOrdersContent() {
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get('phone')
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [showPhoneInput, setShowPhoneInput] = useState(!phoneNumber)

  useEffect(() => {
    if (phoneNumber) {
      fetchOrders(phoneNumber)
    }
  }, [phoneNumber])

  const fetchOrders = async (phone: string) => {
    try {
      const { data, error } = await supabase
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
        .eq('customer_contact', phone)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load your orders')
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load your orders')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string
    
    if (phone) {
      window.location.href = `/your-orders?phone=${encodeURIComponent(phone)}`
    }
  }

  const confirmReceipt = async (orderId: string) => {
    setConfirming(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'Received',
          received_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error confirming receipt:', error)
        alert('Failed to confirm receipt. Please try again.')
      } else {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'Received', received_at: new Date().toISOString() } : order
        ))
        alert('Thank you! Your order receipt has been confirmed.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to confirm receipt. Please try again.')
    } finally {
      setConfirming(null)
    }
  }

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

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (showPhoneInput) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Package className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Orders</h1>
              <p className="text-gray-600">Enter your phone number to view your orders</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="255123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View My Orders
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You can find your phone number in the order confirmation email or SMS you received when placing your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading your orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products or shops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="delivered">Delivered</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t placed any orders yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-shrink-0">
                      {order.product.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt={order.product.name}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{order.product.name}</h4>
                      {order.product.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {order.product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">Shop:</span>
                        <span>{order.product.shop.name}</span>
                        <span className="font-medium">Quantity:</span>
                        <span>{order.quantity}</span>
                        <span className="font-medium">Unit Price:</span>
                        <span>TZS {order.product.price.toLocaleString()}</span>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">
                        Total: TZS {(order.product.price * order.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-700">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Contact:</span>
                        <span className="text-gray-700">{order.customer_contact}</span>
                      </div>
                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="font-medium text-gray-700">Address:</span>
                        <span className="text-gray-700">{order.delivery_address}</span>
                      </div>
                      {order.delivery_location && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="text-gray-700">{order.delivery_location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {order.status === 'Delivered' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Confirm Product Delivery</h4>
                        <p className="text-sm text-blue-700 mb-4">
                          The seller has marked this order as delivered. Please confirm if you have received the product.
                        </p>
                        <button
                          onClick={() => confirmReceipt(order.id)}
                          disabled={confirming === order.id}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {confirming === order.id ? 'Confirming...' : 'Yes, I Received the Product'}
                        </button>
                      </div>
                    </div>
                  )}

                  {order.status === 'Received' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Receipt Confirmed</h4>
                        <p className="text-sm text-green-700">
                          Thank you for confirming receipt of your product. This order is now complete.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'Pending' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Order Pending</h4>
                        <p className="text-sm text-yellow-700">
                          Your order is pending review by the seller. You will be notified when it's accepted.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'Accepted' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Order Accepted</h4>
                        <p className="text-sm text-blue-700">
                          The seller has accepted your order and will deliver it soon.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'Rejected' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Order Rejected</h4>
                        <p className="text-sm text-red-700">
                          This order was rejected by the seller. Please contact the seller for more information.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'Delivered').length}
                </div>
                <div className="text-sm text-gray-600">Awaiting Confirmation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'Received' || o.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function YourOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <YourOrdersContent />
    </Suspense>
  )
}
