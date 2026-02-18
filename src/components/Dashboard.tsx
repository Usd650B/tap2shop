'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shop, Product, Order } from '@/types'
import { generateSlug } from '@/utils/slug'
import { uploadImage, validateImageFile } from '@/utils/upload'
import ShopSettings from './ShopSettings'
import ProductManagement from './ProductManagement'
import OrdersManagement from './OrdersManagement'
import CustomerOrders from './CustomerOrders'

function OverviewTab({ stats, shop }: { stats: any, shop: Shop | null }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalProducts}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalOrders}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">TZS {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v2m0-4c0 1.11-.402 2.08-1.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info Card */}
      {shop && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Shop Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Shop Name</p>
              <p className="text-base font-semibold text-gray-900">{shop.name}</p>
            </div>
            {shop.description && (
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-base text-gray-900">{shop.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Shop Link</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-indigo-600 font-mono truncate">{window.location.origin}/shop/{shop.slug}</p>
                <button
                  onClick={() => {
                    const shopUrl = `${window.location.origin}/shop/${shop.slug}`
                    navigator.clipboard.writeText(shopUrl)
                    alert('Shop link copied to clipboard!')
                  }}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Copy Shop Link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'products' | 'orders' | 'analytics'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isSeller, setIsSeller] = useState(false)

  useEffect(() => {
    if (user) {
      fetchShop()
      fetchProducts()
      fetchOrders()
    }
  }, [user])

  const fetchShop = async () => {
    if (!user) return
    
    const { data: shopData } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    setShop(shopData)
    setIsSeller(!!shopData) // Set isSeller based on whether user has a shop
  }

  const fetchProducts = async () => {
    if (!user || !shop?.id) return
    
    const { data } = await supabase
      .from('products')
      .select('id, shop_id, name, price, description, image_url, created_at, updated_at, stock')
      .eq('shop_id', shop.id)
    
    setProducts(data || [])
  }

  const fetchOrders = async () => {
    if (!user) return
    
    // Check if user is a seller (has a shop) or customer
    const { data: shopData } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (shopData) {
      // User is a seller - fetch orders for their products
      const { data: shopProducts } = await supabase
        .from('products')
        .select('id')
        .eq('shop_id', shopData.id)
      
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .in('product_id', shopProducts?.map(p => p.id) || [])
      
      setOrders(data || [])
    } else {
      // User is a customer - fetch orders they placed
      // Try multiple contact methods: email, phone from metadata, or username
      const contactMethods = [
        user.email,
        user.user_metadata?.phone,
        user.user_metadata?.username,
        user.user_metadata?.full_name
      ].filter(Boolean) // Remove null/undefined values
      
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url,
            shop:shops!inner (
              id,
              name,
              slug
            )
          )
        `)
        .in('customer_contact', contactMethods)
        .order('created_at', { ascending: false })
      
      setOrders(data || [])
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Copy shop link to clipboard
  const copyShopLink = () => {
    if (shop?.slug) {
      const shopUrl = `${window.location.origin}/shop/${shop.slug}`
      navigator.clipboard.writeText(shopUrl)
      alert('Shop link copied to clipboard!')
    }
  }

  // Wrapper functions to handle both refetch and immediate update
  const handleProductsUpdate = (updatedProducts?: Product[]) => {
    if (updatedProducts) {
      setProducts(updatedProducts)
    } else {
      fetchProducts()
    }
  }

  const handleOrdersUpdate = (updatedOrders?: Order[]) => {
    if (updatedOrders) {
      setOrders(updatedOrders)
    } else {
      fetchOrders()
    }
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    totalRevenue: orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + (o.quantity * (o as any).products?.price || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900">SIP</h1>
            </div>
            <button
              onClick={copyShopLink}
              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              title="Copy Shop Link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-white w-80 max-w-full h-full shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">SIP</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1h2a1 1 0 011 1m0 0v5a1 1 0 001 1h3m-6 0h6" />
                  </svg>
                  <span className="font-medium">Overview</span>
                </button>

                <button
                  onClick={() => { setActiveTab('shop'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'shop'
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">Shop Settings</span>
                </button>

                <button
                  onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'products'
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="font-medium">Products</span>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="font-medium">Orders</span>
                </button>

                <button
                  onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">Analytics</span>
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white shadow-lg flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SIP</h1>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1h2a1 1 0 011 1m0 0v5a1 1 0 001 1h3m-6 0h6" />
              </svg>
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'shop'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Shop Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">Products</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="font-medium">Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">Analytics</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'overview' && (isSeller ? 'Dashboard Overview' : 'Your Orders Overview')}
                  {activeTab === 'shop' && 'Shop Settings'}
                  {activeTab === 'products' && 'Product Management'}
                  {activeTab === 'orders' && (isSeller ? 'Order Management' : 'Your Orders')}
                  {activeTab === 'analytics' && 'Analytics'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isSeller ? 'Welcome back! Here\'s what\'s happening with your shop today.' : 'Welcome back! Here are your recent orders.'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={copyShopLink}
                  className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors flex items-center space-x-2"
                  title="Copy Shop Link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.user_metadata?.username || shop?.name || user?.email?.split('@')[0] || 'Shop Owner'}
                  </p>
                  <p className="text-xs text-gray-500">Shop Owner</p>
                </div>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {(user?.user_metadata?.full_name || user?.user_metadata?.username || shop?.name || user?.email?.split('@')[0] || 'S')?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Page Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {activeTab === 'overview' && (isSeller ? 'Dashboard' : 'Your Orders')}
                {activeTab === 'shop' && 'Shop Settings'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'orders' && (isSeller ? 'Orders' : 'Your Orders')}
                {activeTab === 'analytics' && 'Analytics'}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {(user?.user_metadata?.full_name || user?.user_metadata?.username || shop?.name || user?.email?.split('@')[0] || 'S')?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} shop={shop} />}
          {activeTab === 'shop' && <ShopSettings shop={shop} onShopUpdate={fetchShop} />}
          {activeTab === 'products' && <ProductManagement shop={shop} products={products} onProductsUpdate={handleProductsUpdate} />}
          {activeTab === 'orders' && (
          isSeller ? (
            <OrdersManagement orders={orders} onOrdersUpdate={handleOrdersUpdate} />
          ) : (
            <CustomerOrders orders={orders} onOrdersUpdate={handleOrdersUpdate} />
          )
        )}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} orders={orders} />}
        </main>
      </div>
    </div>
  )
}

function AnalyticsTab({ stats, orders }: { stats: any, orders: Order[] }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.totalOrders}</div>
            <div className="text-sm text-gray-600 mt-1">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.pendingOrders}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">TZS {stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
              <div>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{(order as any).products?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">TZS {(order.quantity * ((order as any).products?.price || 0)).toLocaleString()}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
