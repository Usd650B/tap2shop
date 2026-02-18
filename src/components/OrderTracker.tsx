'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle, Clock, Truck, User, MapPin, Phone, Calendar, AlertCircle, CheckSquare } from 'lucide-react'
import { Order } from '@/types'
import { supabase } from '@/lib/supabase'

interface OrderTrackerProps {
  order: Order
  userType: 'customer' | 'seller'
  onUpdate?: () => void
}

export default function OrderTracker({ order, userType, onUpdate }: OrderTrackerProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentOrder, setCurrentOrder] = useState(order)

  useEffect(() => {
    setCurrentOrder(order)
  }, [order])

  const updateOrderStatus = async (newStatus: Order['status']) => {
    setLoading(true)
    setMessage('')

    try {
      const updateData: any = { status: newStatus }
      
      // Add timestamps based on status
      if (newStatus === 'Delivered') {
        updateData.delivered_at = new Date().toISOString()
      } else if (newStatus === 'Received') {
        updateData.received_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', currentOrder.id)

      if (error) {
        console.error('Error updating order:', error)
        setMessage(`Error: ${error.message}`)
      } else {
        setCurrentOrder({ ...currentOrder, ...updateData })
        setMessage('Status updated successfully!')
        if (onUpdate) onUpdate()
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error updating order:', err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusSteps = () => {
    const steps = [
      {
        key: 'Pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        icon: <Package className="w-5 h-5" />,
        completed: true,
        active: currentOrder.status === 'Pending',
        timestamp: currentOrder.created_at
      },
      {
        key: 'Accepted',
        title: 'Order Accepted',
        description: 'Seller has accepted your order',
        icon: <CheckSquare className="w-5 h-5" />,
        completed: ['Accepted', 'Delivered', 'Received', 'Completed'].includes(currentOrder.status),
        active: currentOrder.status === 'Accepted',
        timestamp: currentOrder.updated_at
      },
      {
        key: 'Delivered',
        title: 'Product Delivered',
        description: 'Seller has marked the order as delivered',
        icon: <Truck className="w-5 h-5" />,
        completed: ['Delivered', 'Received', 'Completed'].includes(currentOrder.status),
        active: currentOrder.status === 'Delivered',
        timestamp: currentOrder.delivered_at,
        requiresAction: userType === 'seller' && currentOrder.status === 'Accepted'
      },
      {
        key: 'Received',
        title: 'Product Received',
        description: 'Customer has confirmed receipt',
        icon: <CheckCircle className="w-5 h-5" />,
        completed: ['Received', 'Completed'].includes(currentOrder.status),
        active: currentOrder.status === 'Received',
        timestamp: currentOrder.received_at,
        requiresAction: userType === 'customer' && currentOrder.status === 'Delivered'
      },
      {
        key: 'Completed',
        title: 'Order Completed',
        description: 'Order successfully completed',
        icon: <CheckCircle className="w-5 h-5" />,
        completed: currentOrder.status === 'Completed',
        active: currentOrder.status === 'Completed',
        timestamp: currentOrder.status === 'Completed' ? currentOrder.updated_at : undefined
      }
    ]

    return steps
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Accepted': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'Delivered': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'Received': return 'text-green-600 bg-green-50 border-green-200'
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const steps = getStatusSteps()

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Order Tracking</h3>
            <p className="text-sm opacity-90">Order #{currentOrder.id.slice(-8)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
            {currentOrder.status}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          {currentOrder.product?.image_url ? (
            <img 
              src={currentOrder.product.image_url} 
              alt={currentOrder.product.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{currentOrder.product?.name}</h4>
            <p className="text-sm text-gray-600">Quantity: {currentOrder.quantity}</p>
            <p className="text-sm font-medium text-indigo-600">TZS {currentOrder.product?.price}</p>
          </div>
        </div>
      </div>

      {/* Customer/Seller Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{currentOrder.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{currentOrder.customer_contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{currentOrder.delivery_address}</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Order Details</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Ordered: {formatDate(currentOrder.created_at)}</span>
              </div>
              {currentOrder.delivered_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4" />
                  <span>Delivered: {formatDate(currentOrder.delivered_at)}</span>
                </div>
              )}
              {currentOrder.received_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Received: {formatDate(currentOrder.received_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="p-6">
        <h5 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h5>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-start gap-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                  : step.active 
                  ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-200 animate-pulse'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className={`font-medium ${
                      step.completed ? 'text-green-600' : step.active ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h6>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(step.timestamp)}</p>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  {step.requiresAction && (
                    <button
                      onClick={() => updateOrderStatus(step.key as Order['status'])}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        step.key === 'Delivered' 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? 'Updating...' : (
                        step.key === 'Delivered' ? 'I Delivered' : 'I Received'
                      )}
                    </button>
                  )}
                </div>

                {/* Trust Badge */}
                {step.completed && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Confirmed</span>
                  </div>
                )}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-5 mt-10 w-0.5 h-8 ${
                  step.completed ? 'bg-green-200' : 'bg-gray-200'
                }`} style={{ marginLeft: '20px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      {currentOrder.note && (
        <div className="p-6 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h5>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{currentOrder.note}</p>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 mx-6 mb-6 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.includes('Error') ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        </div>
      )}

      {/* Trust Information */}
      <div className="bg-blue-50 border-t border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h6 className="font-medium text-blue-900 mb-1">Mutual Confirmation System</h6>
            <p className="text-sm text-blue-800">
              {userType === 'seller' 
                ? "You must confirm when you deliver the product. The customer will then confirm receipt to complete the order."
                : "The seller will confirm when they deliver the product. You must confirm receipt to complete the order."
              }
            </p>
            <p className="text-xs text-blue-700 mt-2">
              This mutual confirmation system builds trust between buyers and sellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
