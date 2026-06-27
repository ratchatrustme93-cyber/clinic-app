import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { saveAuth } from '../lib/auth'

export default function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ slug: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      saveAuth(data)
      nav('/dashboard')
    } catch (e) {
      setErr(e.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌸</div>
          <h1 className="text-2xl font-semibold text-gray-800">ClinicOS</h1>
          <p className="text-gray-500 text-sm mt-1">ระบบจัดการคลินิกความงาม</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Clinic Slug</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="my-clinic"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          ยังไม่มีคลินิก?{' '}
          <a href="/register" className="text-pink-500 hover:underline">สมัครใช้งาน</a>
        </p>
      </div>
    </div>
  )
}
