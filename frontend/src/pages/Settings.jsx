import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import api from '../lib/api'
import { getUser } from '../lib/auth'

export default function Settings() {
  const me = getUser()
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [showSvc, setShowSvc] = useState(false)
  const [svcForm, setSvcForm] = useState({ name: '', price: '', durationMin: '' })
  const [showStaff, setShowStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'STAFF' })

  function fetchAll() {
    api.get('/services').then(r => setServices(r.data))
    api.get('/staff').then(r => setStaff(r.data))
  }

  useEffect(() => { fetchAll() }, [])

  async function createService(e) {
    e.preventDefault()
    await api.post('/services', svcForm)
    setShowSvc(false)
    setSvcForm({ name: '', price: '', durationMin: '' })
    fetchAll()
  }

  async function createStaff(e) {
    e.preventDefault()
    await api.post('/staff', staffForm)
    setShowStaff(false)
    setStaffForm({ name: '', email: '', password: '', role: 'STAFF' })
    fetchAll()
  }

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <h2 className="text-lg font-semibold text-gray-800">ตั้งค่า</h2>

      {/* Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">บริการ</h3>
          <button onClick={() => setShowSvc(true)} className="text-xs text-pink-500 flex items-center gap-1 hover:underline">
            <Plus size={12} /> เพิ่มบริการ
          </button>
        </div>
        <div className="space-y-2">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-400">
                  {s.price ? `฿${s.price.toLocaleString()}` : ''}
                  {s.durationMin ? ` · ${s.durationMin} นาที` : ''}
                </p>
              </div>
              <button onClick={() => api.delete(`/services/${s.id}`).then(fetchAll)}
                className="text-xs text-gray-400 hover:text-red-500 transition">ลบ</button>
            </div>
          ))}
          {services.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีบริการ</p>}
        </div>
      </section>

      {/* Staff */}
      {me?.role === 'ADMIN' && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">ทีมงาน</h3>
            <button onClick={() => setShowStaff(true)} className="text-xs text-pink-500 flex items-center gap-1 hover:underline">
              <Plus size={12} /> เพิ่มพนักงาน
            </button>
          </div>
          <div className="space-y-2">
            {staff.map(u => (
              <div key={u.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{u.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Service modal */}
      {showSvc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">เพิ่มบริการ</h3>
              <button onClick={() => setShowSvc(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={createService} className="space-y-3">
              <input required placeholder="ชื่อบริการ" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={svcForm.name} onChange={e => setSvcForm(p => ({ ...p, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="ราคา (฿)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={svcForm.price} onChange={e => setSvcForm(p => ({ ...p, price: e.target.value }))} />
                <input type="number" placeholder="นาที" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={svcForm.durationMin} onChange={e => setSvcForm(p => ({ ...p, durationMin: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSvc(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff modal */}
      {showStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">เพิ่มพนักงาน</h3>
              <button onClick={() => setShowStaff(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={createStaff} className="space-y-3">
              {[
                { ph: 'ชื่อ', field: 'name' },
                { ph: 'อีเมล', field: 'email', type: 'email' },
                { ph: 'รหัสผ่าน', field: 'password', type: 'password' },
              ].map(({ ph, field, type = 'text' }) => (
                <input key={field} required type={type} placeholder={ph}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={staffForm[field]} onChange={e => setStaffForm(p => ({ ...p, [field]: e.target.value }))} />
              ))}
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={staffForm.role} onChange={e => setStaffForm(p => ({ ...p, role: e.target.value }))}>
                <option value="STAFF">STAFF</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowStaff(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
