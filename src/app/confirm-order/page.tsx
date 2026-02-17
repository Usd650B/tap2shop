'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin, User, Phone, Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const phoneNumber = searchParams.get('phone')
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (orderId && phoneNumber) {
      fetchOrder()
    }
  }, [orderId, phoneNumber])

  const fetchOrder = async () => {
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
        .eq('id', orderId)
        .eq('customer_contact', phoneNumber)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        setError('Order not found or invalid access')
      } else {
        setOrder(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const confirmReceipt = async () => {
    if (!order) return
    
    setConfirming(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'Received',
          received_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (error) {
        console.error('Error confirming receipt:', error)
        setError('Failed to confirm receipt. Please try again.')
      } else {
        setSuccess(true)
        // Update local state
        setOrder({
          ...order,
          status: 'Received',
          received_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to confirm receipt. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This order could not be found or you don\'t have access to view it.'}</p>
          <p className="text-sm text-gray-500">Please check your order ID and phone number.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Confirmed!</h1>
          <p className="text-gray-600 mb-4">Thank you for confirming you received the product. The seller has been notified.</p>
          <div className="bg-white rounded-lg shadow-sm p-4 text-left">
            <p className="text-sm font-medium text-gray-900">Order Details:</p>
            <p className="text-sm text-gray-600">Order: #{order.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-600">Product: {order.product.name}</p>
            <p className="text-sm text-gray-600">Confirmed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmation</h1>
          <p className="text-gray-600">Confirm receipt of your product</p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Order #{order.id.slice(0, 8)}</h2>
                <p className="text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </span>
            </div>

            {/* Product Info */}
            <div className="flex space-x-4 mb-6">
              {order.product.image_url ? (
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

            {/* Delivery Info */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-700">{order.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="text-gray-700">{order.customer_contact}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="text-gray-700">{order.delivery_address}</span>
                </div>
                {order.delivery_location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="text-gray-700">{order.delivery_location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            {order.status === 'Delivered' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Confirm Product Receipt</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    The seller has marked this order as delivered. Please confirm if you have received the product.
                  </p>
                  <button
                    onClick={confirmReceipt}
                    disabled={confirming}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirming ? 'Confirming...' : 'Yes, I Received the Product'}
                  </button>
                </div>
              </div>
            )}

            {order.status === 'Received' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Receipt Confirmed</h3>
                  <p className="text-sm text-green-700">
                    Thank you for confirming receipt of your product. The order is now complete.
                  </p>
                </div>
              </div>
            )}

            {order.status === 'Pending' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Order Pending</h3>
                  <p className="text-sm text-yellow-700">
                    Your order is still pending. The seller will review and accept it soon.
                  </p>
                </div>
              </div>
            )}

            {order.status === 'Accepted' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Order Accepted</h3>
                  <p className="text-sm text-blue-700">
                    The seller has accepted your order and will deliver it soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
