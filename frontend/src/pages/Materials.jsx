import { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2, Search, Boxes, AlertTriangle } from 'lucide-react'
import api from '../lib/api'

const EMPTY = { name: '', sku: '', unit: '', cost: '', stockQty: '', reorderLevel: '', note: '' }

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }
  function fetchMaterials() { api.get('/materials').then(r => setMaterials(r.data)) }
  useEffect(() => { fetchMaterials() }, [])

  function openNew() { setEditId(null); setForm(EMPTY); setShowForm(true) }
  function openEdit(m) {
    setEditId(m.id)
    setForm({
      name: m.name, sku: m.sku || '', unit: m.unit || '',
      cost: m.cost ?? '', stockQty: m.stockQty ?? '', reorderLevel: m.reorderLevel ?? '', note: m.note || ''
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await api.put(`/materials/${editId}`, form)
      else await api.post('/materials', form)
      setShowForm(false)
      fetchMaterials()
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('ลบวัสดุนี้?')) return
    await api.delete(`/materials/${id}`); fetchMaterials()
  }

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.sku || '').toLowerCase().includes(search.toLowerCase())
  )
  const isLow = m => m.reorderLevel != null && m.stockQty <= m.reorderLevel

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">วัสดุสิ้นเปลือง</h2>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition">
          <Plus size={14} /> เพิ่มวัสดุ
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="ค้นหาชื่อวัสดุ, SKU..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2 font-medium">วัสดุ</th>
                <th className="px-4 py-2 font-medium text-right">ทุน/หน่วย</th>
                <th className="px-4 py-2 font-medium text-right">คงเหลือ</th>
                <th className="px-4 py-2 font-medium text-right">จุดสั่งซื้อ</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-gray-800 flex items-center gap-1.5">
                      {m.name}
                      {isLow(m) && <AlertTriangle size={13} className="text-amber-500" title="ใกล้หมด" />}
                    </p>
                    {m.sku && <p className="text-xs text-gray-400">{m.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{m.cost != null ? `฿${m.cost.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={isLow(m) ? 'text-amber-600 font-medium' : 'text-gray-700'}>
                      {m.stockQty}{m.unit ? ` ${m.unit}` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{m.reorderLevel ?? '-'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-pink-500"><Pencil size={13} /></button>
                    <button onClick={() => remove(m.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-300">
                  <Boxes size={28} className="mx-auto mb-2 opacity-40" />ยังไม่มีวัสดุ
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editId ? 'แก้ไขวัสดุ' : 'เพิ่มวัสดุ'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">ชื่อวัสดุ *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={set('name')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">SKU</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.sku} onChange={set('sku')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">หน่วย</label>
                  <input placeholder="ชิ้น, ml, กล่อง" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.unit} onChange={set('unit')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">ทุน/หน่วย</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.cost} onChange={set('cost')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">คงเหลือ</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.stockQty} onChange={set('stockQty')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">จุดสั่งซื้อ</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.reorderLevel} onChange={set('reorderLevel')} />
                </div>
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
