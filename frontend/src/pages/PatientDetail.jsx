import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ArrowLeft, Calendar, Package, Plus, Pencil, X } from 'lucide-react'
import api from '../lib/api'

const STATUS_LABEL = {
  PENDING: 'รอยืนยัน', CONFIRMED: 'ยืนยัน', IN_PROGRESS: 'กำลังรักษา',
  DONE: 'เสร็จ', CANCELLED: 'ยกเลิก', NO_SHOW: 'ไม่มา'
}

const FIELDS = [
  { label: 'ชื่อ-นามสกุล *', field: 'name', required: true },
  { label: 'เบอร์โทรศัพท์', field: 'phone' },
  { label: 'อีเมล', field: 'email', type: 'email' },
  { label: 'แพ้ยา/สารใด', field: 'allergies' },
]

export default function PatientDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [patient, setPatient] = useState(null)
  const [allPackages, setAllPackages] = useState([])
  const [showBuyPkg, setShowBuyPkg] = useState(false)
  const [buyPkgId, setBuyPkgId] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  function fetchPatient() {
    api.get(`/patients/${id}`).then(r => setPatient(r.data))
  }

  useEffect(() => {
    fetchPatient()
    api.get('/packages').then(r => setAllPackages(r.data))
  }, [id])

  function openEdit() {
    setEditForm({
      name: patient.name,
      phone: patient.phone || '',
      email: patient.email || '',
      gender: patient.gender || '',
      birthdate: patient.birthdate ? format(new Date(patient.birthdate), 'yyyy-MM-dd') : '',
      allergies: patient.allergies || '',
      note: patient.note || '',
    })
    setShowEdit(true)
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/patients/${id}`, editForm)
      setShowEdit(false)
      fetchPatient()
    } finally {
      setSaving(false)
    }
  }

  async function buyPackage() {
    if (!buyPkgId) return
    await api.post('/packages/patient', { patientId: id, packageId: buyPkgId })
    setShowBuyPkg(false)
    setBuyPkgId('')
    fetchPatient()
  }

  async function useSession(ppId) {
    if (!confirm('หักใช้ 1 session?')) return
    await api.post(`/packages/patient/${ppId}/use`, {})
    fetchPatient()
  }

  if (!patient) return <div className="p-6 text-gray-400 text-sm">กำลังโหลด...</div>

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft size={14} /> กลับ
      </button>

      {/* Patient info */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl flex-shrink-0">
              {patient.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{patient.name}</h2>
              <p className="text-sm text-gray-400">{patient.code}{patient.phone ? ` · ${patient.phone}` : ''}</p>
              {patient.gender && <p className="text-xs text-gray-400">{patient.gender}</p>}
              {patient.email && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">✉️ {patient.email}</span>
              )}
            </div>
          </div>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 border border-gray-200 hover:border-pink-300 px-3 py-1.5 rounded-lg transition"
          >
            <Pencil size={13} /> แก้ไข
          </button>
        </div>

        {patient.allergies && (
          <div className="mt-3 bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600">
            ⚠️ แพ้: {patient.allergies}
          </div>
        )}
        {patient.note && <p className="mt-2 text-xs text-gray-400">{patient.note}</p>}
      </div>

      {/* Packages */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Package size={14} />คอร์ส/แพ็กเกจ</h3>
          <button onClick={() => setShowBuyPkg(true)} className="text-xs text-pink-500 flex items-center gap-1 hover:underline">
            <Plus size={12} /> ซื้อคอร์ส
          </button>
        </div>

        {patient.patientPackages.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">ยังไม่มีคอร์ส</p>
        ) : (
          <div className="space-y-2">
            {patient.patientPackages.map(pp => {
              const remaining = pp.sessionsTotal - pp.sessionsUsed
              const pct = (pp.sessionsUsed / pp.sessionsTotal) * 100
              return (
                <div key={pp.id} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800">{pp.package.name}</p>
                    <span className={`text-xs font-semibold ${remaining === 0 ? 'text-gray-400' : 'text-pink-600'}`}>
                      เหลือ {remaining}/{pp.sessionsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  {remaining > 0 && (
                    <button onClick={() => useSession(pp.id)} className="text-xs text-pink-500 hover:underline">
                      ใช้ session นี้
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Calendar size={14} />ประวัตินัด</h3>
        {patient.appointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">ยังไม่มีประวัตินัด</p>
        ) : (
          <div className="space-y-2">
            {patient.appointments.map(a => (
              <div key={a.id} className="bg-white rounded-xl p-3 border border-gray-100 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800">
                    {format(new Date(a.startAt), 'd MMM yyyy HH:mm', { locale: th })}
                    {a.service ? ` · ${a.service.name}` : ''}
                  </p>
                  <span className="text-xs text-gray-400">{STATUS_LABEL[a.status]}</span>
                </div>
                {a.treatNote && <p className="text-xs text-gray-400 mt-1">{a.treatNote}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">แก้ไขข้อมูลคนไข้</h3>
              <button onClick={() => setShowEdit(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              {FIELDS.map(({ label, field, required }) => (
                <div key={field}>
                  <label className="text-sm text-gray-600 block mb-1">{label}</label>
                  <input
                    required={required}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={editForm[field] || ''}
                    onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-600 block mb-1">เพศ</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editForm.gender}
                  onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="หญิง">หญิง</option>
                  <option value="ชาย">ชาย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">วันเกิด</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editForm.birthdate}
                  onChange={e => setEditForm(p => ({ ...p, birthdate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">หมายเหตุ</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  rows={2}
                  value={editForm.note}
                  onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEdit(false)}
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

      {/* Buy package modal */}
      {showBuyPkg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">ซื้อคอร์ส/แพ็กเกจ</h3>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
              value={buyPkgId}
              onChange={e => setBuyPkgId(e.target.value)}
            >
              <option value="">เลือกคอร์ส...</option>
              {allPackages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.totalSession} ครั้ง · ฿{p.price.toLocaleString()})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowBuyPkg(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600">ยกเลิก</button>
              <button onClick={buyPackage}
                className="flex-1 bg-pink-500 text-white rounded-lg py-2 text-sm hover:bg-pink-600">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
