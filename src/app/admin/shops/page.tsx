import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Package, Calendar, Eye, Edit, Trash2, Search, Filter } from 'lucide-react'

async function getShops() {
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      return []
    }

    // Transform the data to include user information
    const shopsWithUsers = shops?.map(shop => ({
      ...shop,
      user: {
        email: `user_${shop.user_id.slice(0, 8)}@sip.co.tz`,
        user_metadata: {
          full_name: `Shop Owner`,
          shop_name: shop.name
        }
      },
      products: [{ count: 0 }],
      orders: [{ count: 0 }]
    })) || []

    return shopsWithUsers
  } catch (error) {
    console.error('Error fetching shops:', error)
    return []
  }
}

export default async function ShopsPage() {
  const shops = await getShops()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Shop Management</h2>
          <p className="mt-2 text-gray-600">Manage and monitor all platform shops</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search shops..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {shops.reduce((sum: number, shop: any) => sum + (shop.products?.[0]?.count || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {shops.reduce((sum: number, shop: any) => sum + (shop.orders?.[0]?.count || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shops</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {shops.filter((shop: any) => shop.products?.[0]?.count > 0).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Shop Info</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.length > 0 ? (
                  shops.map((shop: any) => (
                    <tr key={shop.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {shop.logo_url ? (
                            <img
                              src={shop.logo_url}
                              alt={shop.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{shop.name}</div>
                            <div className="text-xs text-gray-500">{shop.slug}</div>
                            {shop.description && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {shop.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {shop.user.user_metadata?.full_name || shop.user.user_metadata?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">{shop.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          {shop.products?.[0]?.count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          {shop.orders?.[0]?.count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(shop.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          shop.products?.[0]?.count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {shop.products?.[0]?.count > 0 ? 'Active' : 'Empty'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 text-sm flex items-center">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm flex items-center">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No shops found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
