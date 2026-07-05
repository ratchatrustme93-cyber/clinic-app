import { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2, DoorOpen } from 'lucide-react'
import api from '../lib/api'

const EMPTY = { name: '', type: '', note: '' }

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }
  function fetchRooms() { api.get('/rooms').then(r => setRooms(r.data)) }
  useEffect(() => { fetchRooms() }, [])

  function openNew() { setEditId(null); setForm(EMPTY); setShowForm(true) }
  function openEdit(r) {
    setEditId(r.id)
    setForm({ name: r.name, type: r.type || '', note: r.note || '' })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await api.put(`/rooms/${editId}`, form)
      else await api.post('/rooms', form)
      setShowForm(false)
      fetchRooms()
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('ลบห้องนี้?')) return
    await api.delete(`/rooms/${id}`); fetchRooms()
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">ห้องบริการ</h2>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition">
          <Plus size={14} /> เพิ่มห้อง
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {rooms.map(r => (
          <div key={r.id} className={`bg-white rounded-xl p-4 border flex items-start gap-3 ${r.active ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <DoorOpen size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm">{r.name}</p>
              {r.type && <p className="text-xs text-gray-400">{r.type}</p>}
              {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-pink-500"><Pencil size={13} /></button>
              <button onClick={() => remove(r.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-sm text-gray-300 py-12 text-center sm:col-span-2">ยังไม่มีห้อง</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editId ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">ชื่อห้อง *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ประเภท</label>
                <input placeholder="เช่น เลเซอร์, ทรีตเมนต์, หัตถการ" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={set('type')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมายเหตุ</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" value={form.note} onChange={set('note')} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" disabled={saving} className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
