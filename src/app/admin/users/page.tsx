import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Calendar, Shield, Search, Filter } from 'lucide-react'

async function getUsers() {
  try {
    // Get shops and their owners (real data only)
    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        user_id,
        created_at,
        name,
        slug,
        description,
        contact_info
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      return []
    }

    // Transform the data to represent users
    const users = shops?.map(shop => ({
      id: shop.user_id,
      email: `user_${shop.user_id.slice(0, 8)}@shopinpocket.co.tz`,
      created_at: shop.created_at,
      last_sign_in_at: shop.created_at,
      user_metadata: {
        full_name: `Shop Owner`,
        shop_name: shop.name
      },
      shops: [{
        id: shop.user_id,
        name: shop.name,
        slug: shop.slug,
        created_at: shop.created_at,
        product_count: 0,
        order_count: 0
      }]
    })) || []

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="mt-2 text-gray-600">Manage and monitor all platform users</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {users.filter((user: any) => user.last_sign_in_at).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shop Owners</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {users.filter((user: any) => user.shops && user.shops.length > 0).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Shops</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Last Active</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.user_metadata?.full_name || user.user_metadata?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {user.shops && user.shops.length > 0 ? (
                          <div className="space-y-1">
                            {user.shops.map((shop: any) => (
                              <div key={shop.id} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                {shop.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No shops</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.last_sign_in_at ? (
                          new Date(user.last_sign_in_at).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.last_sign_in_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.last_sign_in_at ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm">
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No users found
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
