'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shop, Product } from '@/types'

interface ShopPageProps {
  shop: Shop
  products: Product[]
}

export default function ShopPage({ shop, products }: ShopPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product)
    setShowOrderForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
            {shop.description && (
              <p className="mt-2 text-lg text-gray-600">{shop.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Contact: {shop.contact_info}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-2xl font-bold text-indigo-600">${product.price}</p>
                  {product.description && (
                    <p className="mt-2 text-gray-600">{product.description}</p>
                  )}
                  
                  <button
                    onClick={() => handleOrderClick(product)}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showOrderForm && selectedProduct && (
        <OrderForm
          product={selectedProduct}
          shop={shop}
          onClose={() => {
            setShowOrderForm(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

function OrderForm({ 
  product, 
  shop, 
  onClose 
}: { 
  product: Product
  shop: Shop
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    delivery_address: '',
    quantity: 1,
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const orderData = {
      product_id: product.id,
      ...formData
    }

    const { error } = await supabase
      .from('orders')
      .insert(orderData)
    
    if (error) {
      setMessage('Error placing order. Please try again.')
    } else {
      setMessage('Order placed successfully! The seller will contact you soon.')
      setTimeout(() => {
        onClose()
        setFormData({
          customer_name: '',
          customer_contact: '',
          delivery_address: '',
          quantity: 1,
          note: ''
        })
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order {product.name}</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Price:</strong> ${product.price} each<br/>
            <strong>Total:</strong> ${(product.price * formData.quantity).toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact (Phone/Email)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.customer_contact}
              onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <textarea
              rows={2}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
            <textarea
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Payment and delivery are arranged directly with the seller. 
              They will contact you using the information provided.
            </p>
          </div>

          {message && (
            <div className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
