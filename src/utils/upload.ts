export async function uploadImage(file: File): Promise<string> {
  if (!file) return ''

  // For now, return a data URL (base64) to avoid Supabase storage complexity
  // In production, you'd upload to Supabase Storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  return allowedTypes.includes(file.type) && file.size <= maxSize
}
