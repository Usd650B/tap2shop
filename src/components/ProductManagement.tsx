'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shop, Product } from '@/types'
import { uploadImage, validateImageFile } from '@/utils/upload'

export default function ProductManagement({ 
  shop, 
  products, 
  onProductsUpdate 
}: { 
  shop: Shop | null
  products: Product[]
  onProductsUpdate: (updatedProducts?: Product[]) => void 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (!error) {
      // Immediately update local state to remove the deleted product
      onProductsUpdate(products.filter(product => product.id !== productId))
    }
  }

  if (!shop) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Please create your shop first before adding products.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products yet. Add your first product!</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                        title="Edit product"
                      >
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                        title="Delete product"
                      >
                        <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-900">TZS {product.price}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (product.stock || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : 'Out of stock'}
                    </span>
                    <button
                      onClick={() => window.open(`/shop/${shop?.slug}`, '_blank')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showAddForm || editingProduct) && (
        <ProductForm
          shop={shop}
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            setShowAddForm(false)
            setEditingProduct(null)
            onProductsUpdate()
          }}
        />
      )}
    </div>
  )
}

function ProductForm({ 
  shop, 
  product, 
  onClose, 
  onSave 
}: { 
  shop: Shop | null
  product: Product | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    stock: product?.stock || 0,
    sizes: product?.sizes || [],
    colors: product?.colors || []
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }))
      setNewSize('')
    }
  }

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }))
  }

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }))
      setNewColor('')
    }
  }

  const removeColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setUploading(true)
    const imageUrl = await uploadImage(file)
    setFormData(prev => ({ ...prev, image_url: imageUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!shop) return

    if (product) {
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', product.id)
      
      if (error) setMessage(error.message)
      else {
        onSave()
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ ...formData, shop_id: shop.id, price: parseFloat(formData.price) })
      
      if (error) setMessage(error.message)
      else {
        onSave()
      }
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (TZS)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              required
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.stock}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value >= 0) {
                  setFormData({ ...formData, stock: value })
                }
              }}
            />
            <p className="mt-1 text-sm text-gray-500">Minimum: 0</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {formData.image_url && (
              <img 
                src={formData.image_url} 
                alt="Product preview" 
                className="mt-2 h-20 w-auto rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Sizes Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter size (e.g., S, M, L, XL, XXL)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Size
              </button>
            </div>
            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colors Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Available Colors</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter color (e.g., Red, Blue, Black, White)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Color
              </button>
            </div>
            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  )
}
