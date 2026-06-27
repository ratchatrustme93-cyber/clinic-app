import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Calendar, Users, Package, Clock } from 'lucide-react'
import api from '../lib/api'
import { getClinic } from '../lib/auth'

export default function Dashboard() {
  const clinic = getClinic()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [appts, setAppts] = useState([])
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0 })

  useEffect(() => {
    api.get(`/appointments?date=${today}`).then(r => setAppts(r.data))
    api.get('/patients').then(r => setStats(s => ({ ...s, patients: r.data.length })))
  }, [today])

  useEffect(() => {
    setStats(s => ({ ...s, todayAppts: appts.length }))
  }, [appts])

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    DONE: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-400',
    NO_SHOW: 'bg-red-100 text-red-400',
  }

  const statusLabel = {
    PENDING: 'รอยืนยัน', CONFIRMED: 'ยืนยันแล้ว', IN_PROGRESS: 'กำลังรักษา',
    DONE: 'เสร็จแล้ว', CANCELLED: 'ยกเลิก', NO_SHOW: 'ไม่มา'
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">{clinic?.name}</h2>
      <p className="text-sm text-gray-400 mb-6">
        {format(new Date(), 'EEEE d MMMM yyyy', { locale: th })}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Calendar className="text-pink-400" size={20} />}
          label="นัดวันนี้" value={stats.todayAppts} color="pink" />
        <StatCard icon={<Users className="text-blue-400" size={20} />}
          label="คนไข้ทั้งหมด" value={stats.patients} color="blue" />
      </div>

      {/* Today appointments */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Clock size={14} /> นัดหมายวันนี้
      </h3>

      {appts.length === 0 ? (
        <div className="text-center py-12 text-gray-300">
          <Calendar size={40} className="mx-auto mb-2" />
          <p className="text-sm">ไม่มีนัดหมายวันนี้</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appts.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-sm">
                  {a.patient.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.patient.name}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(a.startAt), 'HH:mm')} · {a.service?.name || 'ไม่ระบุบริการ'}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[a.status]}`}>
                {statusLabel[a.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    pink: 'bg-pink-50',
    blue: 'bg-blue-50',
  }
  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-3xl font-semibold text-gray-800">{value}</p>
    </div>
  )
}
