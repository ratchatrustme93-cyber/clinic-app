import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X } from 'lucide-react'
import api from '../lib/api'

export default function Patients() {
  const nav = useNavigate()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', birthdate: '', allergies: '', note: '' })

  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function fetchPatients() {
    api.get(`/patients${search ? `?search=${search}` : ''}`).then(r => setPatients(r.data))
  }

  useEffect(() => { fetchPatients() }, [search])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/patients', form)
      setShowForm(false)
      setForm({ name: '', phone: '', gender: '', birthdate: '', allergies: '', note: '' })
      fetchPatients()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">คนไข้</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition"
        >
          <Plus size={14} /> เพิ่มคนไข้
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="ค้นหาชื่อ, รหัสคนไข้, เบอร์โทร..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {patients.map(p => (
          <div
            key={p.id}
            onClick={() => nav(`/patients/${p.id}`)}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-pink-200 transition"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-sm flex-shrink-0">
              {p.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm">{p.name}</p>
              <p className="text-xs text-gray-400">{p.code} {p.phone ? `· ${p.phone}` : ''}</p>
            </div>
            {p.email && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">✉️</span>
            )}
          </div>
        ))}
        {patients.length === 0 && (
          <div className="text-center py-12 text-gray-300">
            <p className="text-sm">ไม่พบข้อมูลคนไข้</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">เพิ่มคนไข้ใหม่</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { label: 'ชื่อ-นามสกุล *', field: 'name', required: true },
                { label: 'เบอร์โทรศัพท์', field: 'phone' },
                { label: 'อีเมล', field: 'email' },
                { label: 'แพ้ยา/สารใด', field: 'allergies' },
              ].map(({ label, field, required }) => (
                <div key={field}>
                  <label className="text-sm text-gray-600 block mb-1">{label}</label>
                  <input
                    required={required}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form[field] || ''}
                    onChange={set(field)}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-600 block mb-1">เพศ</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.gender} onChange={set('gender')}>
                  <option value="">ไม่ระบุ</option>
                  <option value="หญิง">หญิง</option>
                  <option value="ชาย">ชาย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">วันเกิด</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.birthdate} onChange={set('birthdate')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมายเหตุ</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} value={form.note} onChange={set('note')} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 disabled:opacity-50">
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
