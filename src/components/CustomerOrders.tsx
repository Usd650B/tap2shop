'use client'

import { useState } from 'react'
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin, User, Phone, Search, Filter, ExternalLink, Eye } from 'lucide-react'
import { Order } from '@/types'
import { generateOrderConfirmationLink } from '@/utils/orderUtils'
import { supabase } from '@/lib/supabase'
import OrderTracker from './OrderTracker'

interface CustomerOrdersProps {
  orders: Order[]
  onOrdersUpdate: () => void
}

export default function CustomerOrders({ orders, onOrdersUpdate }: CustomerOrdersProps) {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

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
        onOrdersUpdate()
        alert('Thank you! Your receipt has been confirmed.')
      }
    } catch (error) {
      console.error('Error confirming receipt:', error)
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Orders</h2>
            <p className="text-gray-600">Track and manage all your orders</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
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
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt={order.product.name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {order.product?.name || 'Product'}
                      </h4>
                      {order.product?.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {order.product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">Shop:</span>
                        <span>{order.product?.shop?.name || 'Shop'}</span>
                        <span className="font-medium">Quantity:</span>
                        <span>{order.quantity}</span>
                        <span className="font-medium">Unit Price:</span>
                        <span>TZS {order.product?.price?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">
                        Total: TZS {(order.quantity * (order.product?.price || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
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

                  {/* Shop Link */}
                  {order.product?.shop?.slug && (
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Shop:</span>
                          <a
                            href={`/shop/${order.product.shop.slug}`}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                          >
                            {order.product.shop.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Track Order
                      </button>
                      
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => confirmReceipt(order.id)}
                          disabled={confirming === order.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {confirming === order.id ? 'Confirming...' : 'I Received'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {order.status === 'Delivered' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Ready for Confirmation</h4>
                        <p className="text-sm text-blue-700">
                          The seller has marked this order as delivered. Please confirm if you have received the product.
                        </p>
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
          <div className="border-t border-gray-200 pt-6 mt-6">
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

      {/* Order Tracker Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[calc(95vh-80px)] overflow-y-auto">
              <OrderTracker 
                order={trackingOrder} 
                userType="customer" 
                onUpdate={() => {
                  onOrdersUpdate()
                  // Update the tracking order with fresh data
                  const updatedOrder = orders.find(o => o.id === trackingOrder.id)
                  if (updatedOrder) {
                    setTrackingOrder(updatedOrder)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
