import { useEffect, useState } from 'react'
import { Plus, X, Pencil, Stethoscope, HeartHandshake, UserCog, Shield } from 'lucide-react'
import api from '../lib/api'
import { getUser } from '../lib/auth'

const ROLES = {
  ADMIN: { label: 'ผู้ดูแลระบบ', icon: Shield, color: 'bg-gray-100 text-gray-600' },
  DOCTOR: { label: 'แพทย์', icon: Stethoscope, color: 'bg-pink-100 text-pink-600' },
  ASSISTANT: { label: 'ผู้ช่วยแพทย์', icon: HeartHandshake, color: 'bg-purple-100 text-purple-600' },
  STAFF: { label: 'พนักงาน', icon: UserCog, color: 'bg-blue-100 text-blue-600' },
}

const TABS = ['ALL', 'DOCTOR', 'ASSISTANT', 'STAFF', 'ADMIN']
const EMPTY = { name: '', email: '', password: '', role: 'STAFF', phone: '', position: '', specialty: '', licenseNo: '' }

export default function Team() {
  const me = getUser()
  const isAdmin = me?.role === 'ADMIN'
  const [people, setPeople] = useState([])
  const [tab, setTab] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }
  function fetchPeople() { api.get('/staff').then(r => setPeople(r.data)) }
  useEffect(() => { fetchPeople() }, [])

  function openNew() { setEditId(null); setForm(EMPTY); setShowForm(true) }
  function openEdit(u) {
    setEditId(u.id)
    setForm({
      name: u.name, email: u.email, password: '', role: u.role,
      phone: u.phone || '', position: u.position || '',
      specialty: u.specialty || '', licenseNo: u.licenseNo || ''
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await api.put(`/staff/${editId}`, form)
      else await api.post('/staff', form)
      setShowForm(false)
      fetchPeople()
    } catch (err) {
      alert(err.response?.data?.error || 'บันทึกไม่สำเร็จ')
    } finally { setSaving(false) }
  }

  async function deactivate(id) {
    if (!confirm('ปิดการใช้งานบุคลากรคนนี้?')) return
    await api.delete(`/staff/${id}`); fetchPeople()
  }

  const list = people.filter(u => tab === 'ALL' || u.role === tab)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">บุคลากร</h2>
        {isAdmin && (
          <button onClick={openNew}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition">
            <Plus size={14} /> เพิ่มบุคลากร
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${tab === t ? 'bg-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {t === 'ALL' ? 'ทั้งหมด' : ROLES[t].label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {list.map(u => {
          const r = ROLES[u.role] || ROLES.STAFF
          const Icon = r.icon
          return (
            <div key={u.id} className={`bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-3 ${u.active ? '' : 'opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${r.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                  {u.name}
                  {!u.active && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 rounded">ปิดใช้งาน</span>}
                </p>
                <p className="text-xs text-gray-400">{r.label}{u.position ? ` · ${u.position}` : ''}</p>
                {u.specialty && <p className="text-xs text-gray-400">เชี่ยวชาญ: {u.specialty}</p>}
                {u.licenseNo && <p className="text-xs text-gray-400">ใบประกอบฯ: {u.licenseNo}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-pink-500"><Pencil size={13} /></button>
                  {u.active && <button onClick={() => deactivate(u.id)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={13} /></button>}
                </div>
              )}
            </div>
          )
        })}
        {list.length === 0 && <p className="text-sm text-gray-300 py-12 text-center sm:col-span-2">ไม่มีบุคลากรในกลุ่มนี้</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{editId ? 'แก้ไขบุคลากร' : 'เพิ่มบุคลากร'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">ชื่อ-นามสกุล *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">บทบาท</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.role} onChange={set('role')}>
                  <option value="DOCTOR">แพทย์</option>
                  <option value="ASSISTANT">ผู้ช่วยแพทย์</option>
                  <option value="STAFF">พนักงาน</option>
                  <option value="ADMIN">ผู้ดูแลระบบ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">เบอร์โทร</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">ตำแหน่ง</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.position} onChange={set('position')} />
                </div>
              </div>
              {(form.role === 'DOCTOR' || form.role === 'ASSISTANT') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">ความเชี่ยวชาญ</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.specialty} onChange={set('specialty')} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">เลขใบประกอบฯ</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.licenseNo} onChange={set('licenseNo')} />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600 block mb-1">อีเมล (ใช้เข้าระบบ) {editId ? '' : '*'}</label>
                <input type="email" required={!editId} disabled={!!editId}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  value={form.email} onChange={set('email')} />
              </div>
              {!editId && (
                <div>
                  <label className="text-sm text-gray-600 block mb-1">รหัสผ่าน *</label>
                  <input type="password" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.password} onChange={set('password')} />
                </div>
              )}
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
