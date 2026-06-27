import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Mail, X } from 'lucide-react'
import api from '../lib/api'

const STATUS = {
  PENDING: { label: 'รอยืนยัน', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'กำลังรักษา', color: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'เสร็จแล้ว', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-400' },
  NO_SHOW: { label: 'ไม่มา', color: 'bg-red-100 text-red-400' },
}

export default function Appointments() {
  const [date, setDate] = useState(new Date())
  const [appts, setAppts] = useState([])
  const [patients, setPatients] = useState([])
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: '', serviceId: '', startAt: '', note: '' })
  const [saving, setSaving] = useState(false)

  const dateStr = format(date, 'yyyy-MM-dd')

  function fetchAppts() {
    api.get(`/appointments?date=${dateStr}`).then(r => setAppts(r.data))
  }

  useEffect(() => {
    fetchAppts()
  }, [dateStr])

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data))
    api.get('/services').then(r => setServices(r.data))
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
      setForm({ patientId: '', serviceId: '', startAt: '', note: '' })
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
      if (!r.data.ok) {
        alert(`ส่งไม่ได้: ${r.data.reason || r.data.error}`)
      } else if (r.data.status === 'MOCK') {
        alert(`[MOCK] จะส่งไปที่: ${r.data.toEmail} ✅\n(ตั้งค่า SMTP แล้วปิด EMAIL_MOCK เพื่อส่งจริง)`)
      } else {
        alert(`ส่ง Email สำเร็จ ✅\nถึง: ${r.data.toEmail}`)
      }
    } catch (e) {
      alert(`ส่งไม่ได้: ${e.response?.data?.error || e.message}`)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setDate(d => subDays(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {format(date, 'EEEE d MMM yyyy', { locale: th })}
          </h2>
          <button onClick={() => setDate(d => addDays(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500 hover:bg-gray-200"
          >
            วันนี้
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition"
        >
          <Plus size={14} /> สร้างนัด
        </button>
      </div>

      {/* Appointments list */}
      {appts.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p className="text-sm">ไม่มีนัดหมายวันนี้</p>
        </div>
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
                      {a.doctor ? ` · ${a.doctor.name}` : ''}
                    </p>
                    {a.note && <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${STATUS[a.status].color}`}
                  >
                    {Object.entries(STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  {a.patient.email && (
                    <button
                      onClick={() => sendEmail(a.id)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                      title={`ส่ง Email reminder → ${a.patient.email}`}
                    >
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">สร้างนัดหมายใหม่</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">คนไข้</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                >
                  <option value="">เลือกคนไข้...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">บริการ</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.serviceId}
                  onChange={e => setForm({ ...form, serviceId: e.target.value })}
                >
                  <option value="">ไม่ระบุ</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">วันเวลา</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.startAt}
                  onChange={e => setForm({ ...form, startAt: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมายเหตุ</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  rows={2}
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600 disabled:opacity-50">
                  {saving ? 'กำลังบันทึก...' : 'บันทึกนัด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
