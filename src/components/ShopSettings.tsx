'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shop } from '@/types'
import { generateSlug } from '@/utils/slug'
import { uploadImage, validateImageFile } from '@/utils/upload'

export default function ShopSettings({ shop, onShopUpdate }: { 
  shop: Shop | null, 
  onShopUpdate: () => void 
}) {
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    contact_info: shop?.contact_info || '',
    logo_url: shop?.logo_url || '',
    primary_color: shop?.primary_color || '#4F46E5',
    secondary_color: shop?.secondary_color || '#7C3AED',
    accent_color: shop?.accent_color || '#10B981',
    font_style: shop?.font_style || 'modern',
    slug: shop?.slug || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  // Copy shop link to clipboard
  const copyShopLink = () => {
    if (shop?.slug) {
      const shopUrl = `${window.location.origin}/shop/${shop.slug}`
      navigator.clipboard.writeText(shopUrl)
      alert('Shop link copied to clipboard!')
    }
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: shop?.slug || generateSlug(name)
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setUploading(true)
    const logoUrl = await uploadImage(file)
    setFormData(prev => ({ ...prev, logo_url: logoUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (shop) {
      const { error } = await supabase
        .from('shops')
        .update(formData)
        .eq('id', shop.id)
      
      if (error) setMessage(error.message)
      else {
        setMessage('Shop updated successfully!')
        onShopUpdate()
      }
    } else {
      const { error } = await supabase
        .from('shops')
        .insert({ ...formData, user_id: user.id })
      
      if (error) setMessage(error.message)
      else {
        setMessage('Shop created successfully!')
        onShopUpdate()
      }
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {shop ? 'Edit Shop' : 'Create Shop'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Shop URL Slug</label>
            <input
              type="text"
              required
              pattern="[a-z0-9-]+"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            />
            <p className="mt-1 text-sm text-gray-500">
              Your shop will be available at: /shop/{formData.slug}
            </p>
            {shop?.slug && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Your Shop Link:</p>
                    <p className="text-xs text-indigo-600 font-mono">{window.location.origin}/shop/{shop.slug}</p>
                  </div>
                  <button
                    onClick={copyShopLink}
                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-white border border-indigo-300 rounded hover:bg-indigo-50 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            )}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Info (WhatsApp/Email)</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.contact_info}
            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Shop Logo</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onChange={handleLogoUpload}
            disabled={uploading}
          />
          {formData.logo_url && (
            <img 
              src={formData.logo_url} 
              alt="Shop logo" 
              className="mt-2 h-16 w-auto rounded-lg border border-gray-200"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Shop Colors</label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-20">Primary:</span>
                <input
                  type="color"
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#4F46E5"
                />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-20">Secondary:</span>
                <input
                  type="color"
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#7C3AED"
                />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-20">Accent:</span>
                <input
                  type="color"
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  placeholder="#10B981"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick Color Palettes:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primary_color: '#FF6B6B', secondary_color: '#4ECDC4', accent_color: '#45B7D1' })}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs"
                >
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ECDC4' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#45B7D1' }}></div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primary_color: '#8B5CF6', secondary_color: '#3B82F6', accent_color: '#06B6D4' })}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs"
                >
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06B6D4' }}></div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primary_color: '#10B981', secondary_color: '#059669', accent_color: '#047857' })}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs"
                >
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#047857' }}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Font Style</label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.font_style}
            onChange={(e) => setFormData({ ...formData, font_style: e.target.value })}
          >
            <option value="modern">Modern (Clean & Bold)</option>
            <option value="elegant">Elegant (Classic & Professional)</option>
            <option value="playful">Playful (Fun & Creative)</option>
            <option value="minimal">Minimal (Simple & Clean)</option>
          </select>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (shop ? 'Update Shop' : 'Create Shop')}
        </button>
      </form>
    </div>
  )
}
