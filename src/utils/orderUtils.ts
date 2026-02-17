export function generateOrderConfirmationLink(orderId: string, customerPhone: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  return `${baseUrl}/confirm-order?order_id=${orderId}&phone=${encodeURIComponent(customerPhone)}`
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format for Tanzania phone numbers
  if (cleaned.startsWith('255')) {
    return cleaned
  } else if (cleaned.startsWith('0')) {
    return '255' + cleaned.slice(1)
  } else if (cleaned.length === 9) {
    return '255' + cleaned
  }
  
  return cleaned
}

export function validateOrderAccess(orderId: string, customerPhone: string): boolean {
  return !!(orderId && customerPhone && customerPhone.length >= 9)
}
