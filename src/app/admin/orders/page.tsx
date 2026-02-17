import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, DollarSign, Calendar, Eye, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react'

async function getOrders() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products!inner(
          id,
          name,
          price,
          image_url,
          shop:shops!inner(
            id,
            name,
            slug,
            user_id
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to include user information
    const ordersWithUsers = orders?.map(order => ({
      ...order,
      product: {
        ...order.product,
        shop: {
          ...order.product.shop,
          user: {
            email: `user_${order.product.shop.user_id.slice(0, 8)}@example.com`,
            user_metadata: {
              full_name: `Shop Owner`,
              shop_name: order.product.shop.name
            }
          }
        }
      }
    })) || []

    return ordersWithUsers
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Accepted': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800'
  }

  const statusIcons = {
    'Pending': Clock,
    'Accepted': Package,
    'Completed': CheckCircle,
    'Rejected': XCircle
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="mt-2 text-gray-600">Manage and monitor all platform orders</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {orders.filter((order: any) => order.status === 'Pending').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {orders.filter((order: any) => order.status === 'Accepted').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {orders.filter((order: any) => order.status === 'Completed').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${orders
                    .filter((order: any) => order.status === 'Completed')
                    .reduce((sum: number, order: any) => sum + (order.quantity * order.product.price), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Shop</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order: any) => {
                    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
                    return (
                      <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {order.product.image_url ? (
                              <img
                                src={order.product.image_url}
                                alt={order.product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{order.product.name}</div>
                              <div className="text-xs text-gray-500">${order.product.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">{order.customer_contact}</div>
                            <div className="text-xs text-gray-400">{order.delivery_address}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{order.product.shop.name}</div>
                            <div className="text-xs text-gray-500">
                              {order.product.shop.user.user_metadata?.full_name || 
                               order.product.shop.user.user_metadata?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{order.quantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="font-medium">
                              ${(order.quantity * order.product.price).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <StatusIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            {order.status === 'Pending' && (
                              <>
                                <button className="text-green-600 hover:text-green-900 text-sm">
                                  Accept
                                </button>
                                <button className="text-red-600 hover:text-red-900 text-sm">
                                  Reject
                                </button>
                              </>
                            )}
                            {order.status === 'Accepted' && (
                              <button className="text-green-600 hover:text-green-900 text-sm">
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No orders found
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
