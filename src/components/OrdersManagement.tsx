'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { generateOrderConfirmationLink } from '@/utils/orderUtils'

export default function OrdersManagement({ 
  orders, 
  onOrdersUpdate 
}: { 
  orders: Order[]
  onOrdersUpdate: (updatedOrders?: Order[]) => void 
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    
    // Get current order to check stock
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('id', orderId)
      .single()
    
    if (currentOrder && newStatus === 'Accepted' && currentOrder.products) {
      // Reduce stock when order is accepted
      const currentStock = currentOrder.products.stock || 0
      const quantity = currentOrder.quantity || 1
      const newStock = Math.max(0, currentStock - quantity)
      
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', currentOrder.products.id)
    }

    // Add delivered_at timestamp when marking as delivered
    const updateData: any = { status: newStatus }
    if (newStatus === 'Delivered') {
      updateData.delivered_at = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
    
    if (!error) {
      onOrdersUpdate()
    }
    
    setUpdating(null)
  }

  const copyConfirmationLink = async (order: Order) => {
    const confirmationLink = generateOrderConfirmationLink(order.id, order.customer_contact)
    try {
      await navigator.clipboard.writeText(confirmationLink)
      alert('Confirmation link copied to clipboard! Share this with the customer.')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please copy manually: ' + confirmationLink)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
    
    if (!error) {
      // Immediately update local state to remove the deleted order
      onOrdersUpdate(orders.filter(order => order.id !== orderId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Orders Management</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
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
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.product?.name || 'Product'}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TZS {(order.quantity * (order.product?.price || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Received' ? 'bg-green-100 text-green-800' :
                        order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(order.id, 'Accepted')
                            }}
                            disabled={updating === order.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {updating === order.id ? 'Updating...' : 'Accept'}
                          </button>
                        )}
                        {order.status === 'Accepted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(order.id, 'Delivered')
                            }}
                            disabled={updating === order.id}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          >
                            {updating === order.id ? 'Updating...' : 'I Delivered'}
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Waiting for customer confirmation
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyConfirmationLink(order)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy confirmation link for customer"
                            >
                              Copy Link
                            </button>
                          </>
                        )}
                        {order.status === 'Received' && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Order completed
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(order.id)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

function OrderDetailsModal({ 
  order, 
  onClose 
}: { 
  order: Order
  onClose: () => void 
}) {
  if (!order) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border w-72 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <p className="mt-1 text-sm text-gray-900">{order.customer_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact</label>
            <p className="mt-1 text-sm text-gray-900">{order.customer_contact}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <p className="mt-1 text-sm text-gray-900">{order.delivery_address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
            <p className="mt-1 text-sm text-gray-900">{order.delivery_location}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <div className="mt-1 flex items-center space-x-3">
              {(order as any).products?.image_url ? (
                <img
                  src={(order as any).products.image_url}
                  alt={(order as any).products.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002 2h-2a2 2 0 002 2m0 0V5a2 2 0 012-2h-2a2 2 0 012 2h-2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{(order as any).products?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">Product ID: {(order as any).products?.id || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <p className="mt-1 text-sm text-gray-900">{order.quantity}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              TZS {(order.quantity * ((order as any).products?.price || 0)).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              order.status === 'Completed' ? 'bg-green-100 text-green-800' :
              order.status === 'Received' ? 'bg-green-100 text-green-800' :
              order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {order.status}
            </span>
          </div>

          {order.note && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Note</label>
              <p className="mt-1 text-sm text-gray-900">{order.note}</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
