import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Store, Package, ShoppingCart, DollarSign, Calendar } from 'lucide-react'

async function getAnalyticsData() {
  try {
    // Get basic counts
    const { count: shopsCount } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true })

    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get monthly data for trends
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentUsers } = await supabase
      .from('auth.users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: recentShops } = await supabase
      .from('shops')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('created_at, quantity, products:product_id (price)')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get top performing shops
    const { data: topShops } = await supabase
      .from('shops')
      .select(`
        id,
        name,
        slug,
        products:products(count),
        orders:orders(count)
      `)
      .order('orders.count', { ascending: false })
      .limit(5)

    // Get top selling products
    const { data: topProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        orders:orders(count),
        shop:shops!inner(name)
      `)
      .order('orders.count', { ascending: false })
      .limit(5)

    // Calculate revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('quantity, products:product_id (price)')
      .eq('status', 'Completed')

    const totalRevenue = revenueData?.reduce((sum: number, order: any) => {
      return sum + (order.quantity * order.products.price)
    }, 0) || 0

    const recentRevenue = recentOrders?.reduce((sum: number, order: any) => {
      return sum + (order.quantity * order.products.price)
    }, 0) || 0

    // Estimate users count based on unique shop owners
    const { data: uniqueUsers } = await supabase
      .from('shops')
      .select('user_id')

    const usersCount = new Set(uniqueUsers?.map(shop => shop.user_id)).size

    return {
      usersCount,
      shopsCount: shopsCount || 0,
      productsCount: productsCount || 0,
      ordersCount: ordersCount || 0,
      totalRevenue,
      recentRevenue,
      recentUsersCount: recentUsers?.length || 0,
      recentShopsCount: recentShops?.length || 0,
      recentOrdersCount: recentOrders?.length || 0,
      topShops: topShops || [],
      topProducts: topProducts || []
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return {
      usersCount: 0,
      shopsCount: 0,
      productsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      recentRevenue: 0,
      recentUsersCount: 0,
      recentShopsCount: 0,
      recentOrdersCount: 0,
      topShops: [],
      topProducts: []
    }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const growthRate = ((data.recentUsersCount / Math.max(data.usersCount - data.recentUsersCount, 1)) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="mt-2 text-gray-600">Comprehensive insights into your platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data.usersCount.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{data.recentUsersCount}</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data.shopsCount.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{data.recentShopsCount}</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Store className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data.ordersCount.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{data.recentOrdersCount}</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${data.totalRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+${data.recentRevenue.toFixed(2)}</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{growthRate}%</p>
                <p className="text-sm text-gray-600 mt-1">Monthly growth</p>
              </div>
              <div className={`p-3 rounded-lg ${parseFloat(growthRate) > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {parseFloat(growthRate) > 0 ? (
                  <TrendingUp className={`w-6 h-6 text-green-600`} />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Orders per Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.shopsCount > 0 ? (data.ordersCount / data.shopsCount).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Orders per shop</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Products per Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.shopsCount > 0 ? (data.productsCount / data.shopsCount).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Products per shop</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topShops.length > 0 ? (
                data.topShops.map((shop: any, index: number) => (
                  <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{shop.name}</p>
                        <p className="text-sm text-gray-500">{shop.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{shop.orders?.[0]?.count || 0} orders</p>
                      <p className="text-sm text-gray-500">{shop.products?.[0]?.count || 0} products</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No shops found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.shop.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{product.orders?.[0]?.count || 0} orders</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No products found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
