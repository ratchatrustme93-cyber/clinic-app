import { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import api from '../lib/api'

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editPkg, setEditPkg] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', totalSession: '', price: '', validDays: '' })
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function fetchPackages() {
    api.get('/packages').then(r => setPackages(r.data))
  }

  useEffect(() => { fetchPackages() }, [])

  function openCreate() {
    setEditPkg(null)
    setForm({ name: '', description: '', totalSession: '', price: '', validDays: '' })
    setShowForm(true)
  }

  function openEdit(pkg) {
    setEditPkg(pkg)
    setForm({ name: pkg.name, description: pkg.description || '', totalSession: pkg.totalSession, price: pkg.price, validDays: pkg.validDays || '' })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editPkg) {
        await api.put(`/packages/${editPkg.id}`, form)
      } else {
        await api.post('/packages', form)
      }
      setShowForm(false)
      fetchPackages()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('ลบแพ็กเกจนี้?')) return
    await api.delete(`/packages/${id}`)
    fetchPackages()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">คอร์ส / แพ็กเกจ</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition"
        >
          <Plus size={14} /> เพิ่มแพ็กเกจ
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-12 text-gray-300 text-sm">ยังไม่มีแพ็กเกจ</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {packages.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{p.totalSession} ครั้ง</span>
                <span className="text-sm font-semibold text-gray-800">฿{p.price.toLocaleString()}</span>
                {p.validDays && <span className="text-xs text-gray-400">หมดอายุใน {p.validDays} วัน</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editPkg ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจ'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">ชื่อแพ็กเกจ *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">คำอธิบาย</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.description} onChange={set('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">จำนวนครั้ง *</label>
                  <input required type="number" min="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.totalSession} onChange={set('totalSession')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">ราคา (฿) *</label>
                  <input required type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.price} onChange={set('price')} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมดอายุภายใน (วัน)</label>
                <input type="number" min="1" placeholder="ไม่จำกัด" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.validDays} onChange={set('validDays')} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600">ยกเลิก</button>
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
