/** @type {import('next').NextConfig} */
const backend = (process.env.NORD_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')
if (!/^https?:\/\//.test(backend)) throw new Error('NORD_API_URL deve ser uma URL HTTP(S) do backend Nord')
const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }]
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }]
  },
}
export default nextConfig