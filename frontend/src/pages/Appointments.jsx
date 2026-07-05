import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Mail, X, Boxes, Trash2, DoorOpen, Stethoscope, HeartHandshake } from 'lucide-react'
import api from '../lib/api'

const STATUS = {
  PENDING: { label: 'รอยืนยัน', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'กำลังรักษา', color: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'เสร็จแล้ว', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-400' },
  NO_SHOW: { label: 'ไม่มา', color: 'bg-red-100 text-red-400' },
}

const EMPTY = { patientId: '', doctorId: '', assistantId: '', serviceId: '', roomId: '', startAt: '', note: '' }

export default function Appointments() {
  const [date, setDate] = useState(new Date())
  const [appts, setAppts] = useState([])
  const [patients, setPatients] = useState([])
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [assistants, setAssistants] = useState([])
  const [rooms, setRooms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [usageAppt, setUsageAppt] = useState(null)

  const dateStr = format(date, 'yyyy-MM-dd')
  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function fetchAppts() {
    api.get(`/appointments?date=${dateStr}`).then(r => setAppts(r.data))
  }

  useEffect(() => { fetchAppts() }, [dateStr])

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data))
    api.get('/services').then(r => setServices(r.data))
    api.get('/staff?role=DOCTOR&active=1').then(r => setDoctors(r.data))
    api.get('/staff?role=ASSISTANT&active=1').then(r => setAssistants(r.data))
    api.get('/rooms').then(r => setRooms(r.data.filter(x => x.active)))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/appointments', {
        ...form,
        startAt: new Date(form.startAt).toISOString()
      })
      setShowForm(false)
      setForm(EMPTY)
      fetchAppts()
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    await api.put(`/appointments/${id}`, { status })
    fetchAppts()
  }

  async function sendEmail(id) {
    try {
      const r = await api.post(`/appointments/${id}/send-email`)
      if (!r.data.ok) alert(`ส่งไม่ได้: ${r.data.reason || r.data.error}`)
      else if (r.data.status === 'MOCK') alert(`[MOCK] จะส่งไปที่: ${r.data.toEmail} ✅`)
      else alert(`ส่ง Email สำเร็จ ✅\nถึง: ${r.data.toEmail}`)
    } catch (e) {
      alert(`ส่งไม่ได้: ${e.response?.data?.error || e.message}`)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setDate(d => subDays(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
          <h2 className="text-lg font-semibold text-gray-800">{format(date, 'EEEE d MMM yyyy', { locale: th })}</h2>
          <button onClick={() => setDate(d => addDays(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
          <button onClick={() => setDate(new Date())} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500 hover:bg-gray-200">วันนี้</button>
        </div>
        <button onClick={() => { setForm(EMPTY); setShowForm(true) }}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition">
          <Plus size={14} /> สร้างนัด
        </button>
      </div>

      {/* Appointments list */}
      {appts.length === 0 ? (
        <div className="text-center py-16 text-gray-300"><p className="text-sm">ไม่มีนัดหมายวันนี้</p></div>
      ) : (
        <div className="space-y-2">
          {appts.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-sm">
                    {a.patient.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.patient.name}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(a.startAt), 'HH:mm')}
                      {a.service ? ` · ${a.service.name}` : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                      {a.doctor && <span className="flex items-center gap-1"><Stethoscope size={11} />{a.doctor.name}</span>}
                      {a.assistant && <span className="flex items-center gap-1"><HeartHandshake size={11} />{a.assistant.name}</span>}
                      {a.room && <span className="flex items-center gap-1"><DoorOpen size={11} />{a.room.name}</span>}
                    </div>
                    {a.note && <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setUsageAppt(a)} className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg" title="รายการที่ใช้กับคนไข้">
                    <Boxes size={15} />
                  </button>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${STATUS[a.status].color}`}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {a.patient.email && (
                    <button onClick={() => sendEmail(a.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title={`ส่ง Email → ${a.patient.email}`}>
                      <Mail size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">สร้างนัดหมายใหม่</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">คนไข้ *</label>
                <select required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.patientId} onChange={set('patientId')}>
                  <option value="">เลือกคนไข้...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">บริการ</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.serviceId} onChange={set('serviceId')}>
                  <option value="">ไม่ระบุ</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">แพทย์</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.doctorId} onChange={set('doctorId')}>
                    <option value="">ไม่ระบุ</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">ผู้ช่วยแพทย์</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.assistantId} onChange={set('assistantId')}>
                    <option value="">ไม่ระบุ</option>
                    {assistants.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ห้อง</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.roomId} onChange={set('roomId')}>
                  <option value="">ไม่ระบุ</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">วันเวลา *</label>
                <input type="datetime-local" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.startAt} onChange={set('startAt')} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมายเหตุ</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} value={form.note} onChange={set('note')} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" disabled={saving} className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึกนัด'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage modal */}
      {usageAppt && <UsageModal appt={usageAppt} onClose={() => setUsageAppt(null)} />}
    </div>
  )
}

// รายการสินค้า/วัสดุที่ใช้กับคนไข้ในนัดนี้
function UsageModal({ appt, onClose }) {
  const [usages, setUsages] = useState([])
  const [products, setProducts] = useState([])
  const [materials, setMaterials] = useState([])
  const [itemType, setItemType] = useState('MATERIAL')
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState('1')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  function fetchUsages() { api.get(`/usages?appointmentId=${appt.id}`).then(r => setUsages(r.data)) }
  useEffect(() => {
    fetchUsages()
    api.get('/products').then(r => setProducts(r.data))
    api.get('/materials').then(r => setMaterials(r.data))
  }, [appt.id])

  const options = itemType === 'PRODUCT' ? products : materials

  async function add(e) {
    e.preventDefault()
    if (!itemId) return
    setSaving(true)
    try {
      await api.post('/usages', {
        appointmentId: appt.id,
        itemType,
        productId: itemType === 'PRODUCT' ? itemId : undefined,
        materialId: itemType === 'MATERIAL' ? itemId : undefined,
        qty, note
      })
      setItemId(''); setQty('1'); setNote('')
      fetchUsages()
    } catch (err) {
      alert(err.response?.data?.error || 'บันทึกไม่สำเร็จ')
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('ลบรายการนี้ (คืนสต๊อก)?')) return
    await api.delete(`/usages/${id}`); fetchUsages()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800">รายการที่ใช้กับคนไข้</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-400 mb-4">{appt.patient.name}</p>

        {/* Existing usages */}
        <div className="space-y-2 mb-4">
          {usages.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีรายการ</p>}
          {usages.map(u => (
            <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm text-gray-800">{u.name} <span className="text-gray-400">× {u.qty}</span></p>
                <p className="text-[11px] text-gray-400">
                  {u.itemType === 'PRODUCT' ? 'สินค้า' : 'วัสดุ'}{u.note ? ` · ${u.note}` : ''}
                </p>
              </div>
              <button onClick={() => remove(u.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <form onSubmit={add} className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex gap-1">
            {['MATERIAL', 'PRODUCT'].map(t => (
              <button key={t} type="button" onClick={() => { setItemType(t); setItemId('') }}
                className={`flex-1 py-1.5 rounded-lg text-xs transition ${itemType === t ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t === 'MATERIAL' ? 'วัสดุ' : 'สินค้า'}
              </button>
            ))}
          </div>
          <select required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={itemId} onChange={e => setItemId(e.target.value)}>
            <option value="">เลือก{itemType === 'PRODUCT' ? 'สินค้า' : 'วัสดุ'}...</option>
            {options.map(o => <option key={o.id} value={o.id}>{o.name} (คงเหลือ {o.stockQty}{o.unit ? ` ${o.unit}` : ''})</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min="1" required placeholder="จำนวน" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={qty} onChange={e => setQty(e.target.value)} />
            <input placeholder="หมายเหตุ" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : '+ เพิ่มรายการ (หักสต๊อก)'}
          </button>
        </form>
      </div>
    </div>
  )
}
