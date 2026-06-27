import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { saveAuth } from '../lib/auth'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({ clinicName: '', slug: '', name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) { return e => setForm({ ...form, [field]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const { data } = await api.post('/auth/register-clinic', form)
      saveAuth({ ...data, clinicName: form.clinicName })
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
          <h1 className="text-xl font-semibold text-gray-800">สร้างคลินิกใหม่</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'ชื่อคลินิก', field: 'clinicName', placeholder: 'Beauty Clinic Bangkok' },
            { label: 'Slug (URL ย่อ)', field: 'slug', placeholder: 'beauty-clinic-bkk' },
            { label: 'ชื่อผู้ดูแล', field: 'name', placeholder: 'คุณหมอสมใจ' },
            { label: 'อีเมล', field: 'email', placeholder: 'admin@clinic.com', type: 'email' },
            { label: 'รหัสผ่าน', field: 'password', placeholder: '••••••••', type: 'password' },
          ].map(({ label, field, placeholder, type = 'text' }) => (
            <div key={field}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder={placeholder}
                value={form[field]}
                onChange={set(field)}
                required
              />
            </div>
          ))}
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'กำลังสร้าง...' : 'สร้างคลินิก'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          มีบัญชีแล้ว?{' '}
          <a href="/login" className="text-pink-500 hover:underline">เข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  )
}
