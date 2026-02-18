'use client'

import { useState, useEffect, use } from 'react'
import { Shop, Product } from '@/types'
import { supabase } from '@/lib/supabase'

interface ShopPageProps {
  shop: Shop
  products: Product[]
}

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!isMounted) return
      
      setLoading(true)
      setError(null)
      
      try {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', slug)
          .single()

        if (shopError) throw shopError

        if (shopData && isMounted) {
          setShop(shopData)
          
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, shop_id, name, price, description, image_url, created_at, updated_at, stock')
            .eq('shop_id', shopData.id)
          
          if (productsError) throw productsError
          
          if (isMounted) {
            console.log('Fetched products:', productsData)
            setProducts(productsData || [])
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching shop data:', err)
          setError('Failed to load shop. Please try again.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading shop...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Shop</h1>
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

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Shop not found</h1>
          <p className="mt-2 text-gray-600">This shop doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return <ShopClient shop={shop} products={products} />
}

function ShopClient({ shop, products: initialProducts }: { shop: Shop; products: Product[] }) {
  // Add product gallery state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Memoize filtered products to prevent unnecessary re-renders
  useEffect(() => {
    const filtered = products.filter((product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  // Update products when initialProducts change (only if different)
  useEffect(() => {
    if (JSON.stringify(initialProducts) !== JSON.stringify(products)) {
      setProducts(initialProducts)
      setFilteredProducts(
        initialProducts.filter((product: Product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [initialProducts, searchTerm, products.length])

  // Manual refresh function
  const refreshProducts = async () => {
    setIsRefreshing(true)
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('id, shop_id, name, price, description, image_url, created_at, updated_at, stock')
        .eq('shop_id', shop.id)
      
      if (error) throw error
      
      const updatedProducts = productsData || []
      setProducts(updatedProducts)
      setFilteredProducts(
        updatedProducts.filter((product: Product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } catch (error) {
      console.error('Error refreshing products:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product)
    setCurrentMediaIndex(0)
    setShowOrderForm(true)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setCurrentMediaIndex(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="shadow-lg" style={{ backgroundColor: shop.primary_color || '#4F46E5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left Section - Logo and Shop Info */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {shop.logo_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={shop.logo_url} 
                    alt={shop.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl shadow-lg border-2 border-white/20"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 
                  className="text-2xl sm:text-3xl font-bold mb-1 truncate"
                  style={{ 
                    color: 'white',
                    fontFamily: shop.font_style === 'elegant' ? 'serif' : 
                               shop.font_style === 'playful' ? 'cursive' :
                               shop.font_style === 'minimal' ? 'sans-serif' : 'system-ui'
                  }}
                >
                  {shop.name}
                </h1>
                {shop.description && (
                  <p className="text-sm sm:text-lg opacity-90 max-w-md line-clamp-2 sm:line-clamp-none" style={{ color: 'white' }}>
                    {shop.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section - Contact and CTA */}
            <div className="text-left sm:text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                <p className="text-sm font-medium mb-2" style={{ color: 'white' }}>
                  📞 Contact Seller
                </p>
                <p className="text-lg font-semibold" style={{ color: 'white' }}>
                  {shop.contact_info}
                </p>
                <button
                  onClick={() => {
                    // For now just scroll, but this could link to a filtered view
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="mt-3 px-4 py-2 bg-white text-sm font-medium rounded-lg transition-all hover:scale-105 shadow-md"
                  style={{ 
                    color: shop.primary_color || '#4F46E5'
                  }}
                >
                  🛍️ Browse Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                style={{ 
                  borderColor: shop.secondary_color || '#7C3AED'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={refreshProducts}
              disabled={isRefreshing}
              className="px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              style={{ 
                borderColor: shop.secondary_color || '#7C3AED',
                color: shop.primary_color || '#4F46E5'
              }}
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          {searchTerm && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold" style={{ color: shop.primary_color || '#4F46E5' }}>
                  {filteredProducts.length}
                </span> product{filteredProducts.length !== 1 ? 's' : ''} for "
                <span className="font-semibold">"{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 9.172 4 4 0 00-5.656-9.172 4H4a4 4 0 00-4 4v1a4 4 0 004 4h1.586a4 4 0 003.993.401 3.993V15a4 4 0 00-3.993-3.401A4 4 0 004 11.586H4a4 4 0 00-4 4v1a4 4 0 004 4h1.586a4 4 0 003.993.401 3.993V15a4 4 0 00-3.993-3.401A4 4 0 004 11.586H4a4 4 0 00-4 4v1a4 4 0 004 4h1.586a4 4 0 003.993.401 3.993V15a4 4 0 00-3.993-3.401A4 4 0 004 11.586H4a4 4 0 00-4 4v1a4 4 0 004 4z" />
                </svg>
                <p className="text-gray-500">No products found for "<span className="font-semibold">{searchTerm}</span>"</p>
                <p className="text-sm text-gray-400 mt-2">Try searching with different keywords</p>
              </div>
            ) : (
              <p className="text-gray-500">No products available yet.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product: Product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 cursor-pointer transform hover:-translate-y-1" 
                style={{ borderColor: shop.secondary_color || '#7C3AED' }}
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onLoad={(e) => {
                        // Hide placeholder when image loads successfully
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'none'
                        }
                      }}
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = 'none'
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'flex'
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-4 h-4" style={{ color: shop.primary_color || '#4F46E5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 8v8m0 0l-3-3m3 3l3-3m-6-3h6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 
                    className="font-semibold text-sm line-clamp-2 mb-2 leading-tight"
                    style={{ 
                      color: '#1f2937',
                      fontFamily: shop.font_style === 'elegant' ? 'serif' : 
                                 shop.font_style === 'playful' ? 'cursive' :
                                 shop.font_style === 'minimal' ? 'sans-serif' : 'system-ui'
                    }}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <p 
                      className="text-sm font-bold"
                      style={{ color: shop.primary_color || '#4F46E5' }}
                    >
                      TZS {product.price}
                    </p>
                    
                    {/* Stock Badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (product.stock || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {(product.stock || 0) > 0 ? `${product.stock || 0}` : '0'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOrderClick(product)
                    }}
                    disabled={(product.stock || 0) === 0}
                    className="w-full text-xs font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    style={{
                      backgroundColor: (product.stock || 0) > 0 ? (shop.accent_color || '#10B981') : '#e5e7eb',
                      color: (product.stock || 0) > 0 ? 'white' : '#9ca3af'
                    }}
                  >
                    {(product.stock || 0) > 0 ? 'Order Now' : 'Out of Stock'}
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

      {/* Product Details Modal - Amazon/Alibaba Style */}
      {selectedProduct && !showOrderForm && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:max-w-5xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors lg:top-6 lg:right-6"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              {/* Left Side - Product Images */}
              <div className="lg:w-2/5 p-4 lg:p-6 bg-gray-50 border-r border-gray-200">
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-inner">
                    {selectedProduct.image_url ? (
                      <img 
                        src={selectedProduct.image_url} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain"
                        onLoad={(e) => {
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                          if (placeholder) placeholder.style.display = 'none'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                          if (placeholder) placeholder.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    
                    <div className="w-full h-full flex items-center justify-center" style={{ display: selectedProduct.image_url ? 'none' : 'flex' }}>
                      <svg className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Thumbnail Images */}
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((thumb) => (
                      <div key={thumb} className="aspect-square overflow-hidden rounded border border-gray-300 bg-white cursor-pointer hover:border-blue-500 transition-colors">
                        {selectedProduct.image_url ? (
                          <img 
                            src={selectedProduct.image_url} 
                            alt={`Thumbnail ${thumb}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Product Info */}
              <div className="lg:w-3/5 p-4 lg:p-6 overflow-y-auto flex-1">
                {/* Product Title */}
                <h1 
                  className="text-lg lg:text-xl font-bold text-gray-900 mb-2"
                  style={{ 
                    fontFamily: shop.font_style === 'elegant' ? 'serif' : 
                               shop.font_style === 'playful' ? 'cursive' :
                               shop.font_style === 'minimal' ? 'sans-serif' : 'system-ui'
                  }}
                >
                  {selectedProduct.name}
                </h1>

                {/* Rating and Reviews */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.19 6.88L12 22l-6.19-3.88-5-4.87 6.81-1.19z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">(24 reviews)</span>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl lg:text-2xl font-bold" style={{ color: shop.primary_color || '#4F46E5' }}>
                      TZS {selectedProduct.price}
                    </span>
                    <span className="text-xs text-gray-500 line-through">TZS {(selectedProduct.price * 1.2).toFixed(2)}</span>
                    <span className="text-xs text-green-600 font-semibold">Save 20%</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-green-600 font-semibold">In Stock - {selectedProduct.stock || 0} available</span>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Product Features */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-gray-700">Quality Assured</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3l3 3m-9-6h6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6z" />
                      </svg>
                      <span className="text-xs text-gray-700">Fast Delivery</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6z" />
                      </svg>
                      <span className="text-xs text-gray-700">Best Price</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                      <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364L12 3.636l-7.682 7.682z" />
                      </svg>
                      <span className="text-xs text-gray-700">Top Rated</span>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Seller Information</h3>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h4v3h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4v-3a7 7 0 007-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{shop.name}</p>
                        <p className="text-xs text-gray-600">Verified Seller</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700">📞 {shop.contact_info}</p>
                  </div>
                </div>

                {/* Action Buttons - Sticky at bottom */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-auto">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowOrderForm(true)
                      }}
                      className="flex-1 px-4 py-3 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 text-sm lg:text-base shadow-lg"
                      style={{ backgroundColor: shop.accent_color || '#10B981' }}
                    >
                      🛒 Order Now
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-3 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors text-sm lg:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    delivery_location: '',
    quantity: 1,
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const orderData: any = {
      product_id: product.id,
      customer_name: formData.customer_name.trim(),
      customer_contact: formData.customer_contact.trim(),
      delivery_address: formData.delivery_address.trim(),
      quantity: Number(formData.quantity) || 1,
      note: formData.note.trim() || null
    }
    
    // Only include delivery_location if it has a value
    if (formData.delivery_location.trim()) {
      orderData.delivery_location = formData.delivery_location.trim()
    }

    console.log('Submitting order:', orderData)

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
      
      console.log('Order response:', { data, error })
      
      if (error) {
        console.error('Order error:', error)
        setMessage(`Error: ${error.message || 'Failed to place order. Please try again.'}`)
      } else {
        console.log('Order placed successfully:', data)
        setMessage('Order placed successfully! The seller will contact you soon.')
        setTimeout(() => {
          onClose()
          setFormData({
            customer_name: '',
            customer_contact: '',
            delivery_address: '',
            delivery_location: '',
            quantity: 1,
            note: ''
          })
        }, 2000)
      }
    } catch (err) {
      console.error('Order submission error:', err)
      setMessage('Network error. Please check your connection and try again.')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Complete Your Order</h3>
              <p className="text-sm opacity-90">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M9 12l2 2M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          {/* Product Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-4">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 6h.01" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-600">TZS {product.price}</span>
                  <span className="text-sm text-gray-500">/{product.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Customer Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2V5a2 2 0 002-2zm0 0h14a3 3 0 006-3 3v6a3 3 0 006-3s2.242 0L15 12a3 3 0 006-3 3v6a3 3 0 002.242 0L6 8a3 3 0 006-3 3v6a3 3 0 002.242 0z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="+255 123 456 789"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.customer_contact}
                      onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">We'll use this to contact you about your order</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter your complete delivery address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Region/Area
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.delivery_location}
                    onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                  >
                    <option value="">Select your region</option>
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Kinondoni">Kinondoni</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mbeya">Mbeya</option>
                    <option value="Tanga">Tanga</option>
                    <option value="Morogoro">Morogoro</option>
                    <option value="Tabora">Tabora</option>
                    <option value="Iringa">Iringa</option>
                    <option value="Kigoma">Kigoma</option>
                    <option value="Moshi">Moshi</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Helps us provide faster delivery service</p>
                </div>
              </div>

              {/* Right Column - Order Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: Math.max(1, (formData.quantity || 1) - 1) })}
                      className="absolute left-2 top-1/2 px-3 py-2 bg-gray-100 text-gray-600 rounded-l-md hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: Math.min(10, (formData.quantity || 1) + 1) })}
                      className="absolute right-2 top-1/2 px-3 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-4 8h16m-4 8v-12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Available stock: {product.stock || 0} items</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any special delivery instructions or requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unit Price:</span>
                      <span className="font-semibold text-gray-900">TZS {product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-900">{formData.quantity || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">TZS {(product.price * (formData.quantity || 1)).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-indigo-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-indigo-600">Total: TZS {(product.price * (formData.quantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.includes('Error') || message.includes('Network') 
                  ? 'bg-red-50 border border-red-200 text-red-800' 
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                <div className="flex items-start gap-3">
                  {message.includes('Error') || message.includes('Network') ? (
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h8m-4 8v12M12 20l-4-4m6 4h6m-4 8v6M12 16l-4-4m6 4h6m-4 8v6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 4h6m-4 8v6m-6 6h6m-4 8v6m11 5l-5-5-5 5 5 5 5z" />
                    </svg>
                  )}
                  <div>
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v12a8 8 0 00-8 8v4a8 8 0 002-2 2h4a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2-2V4a2 2 0 002-2z" />
                    </svg>
                    Placing Order...
                  </div>
                ) : (
                  <div>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 6h.01" />
                    </svg>
                    Place Order
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            <p className="mb-2">
              <strong>Payment & Delivery:</strong> Arranged directly with seller
            </p>
            <p>
              <strong>Delivery Time:</strong> 2-3 business days
            </p>
            <p className="text-gray-400">
              Your order will be confirmed by the seller. You'll receive updates via WhatsApp/Email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
