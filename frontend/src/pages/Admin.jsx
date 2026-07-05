import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  Shield, Users, Stethoscope, HeartHandshake, UserCog, Calendar,
  DoorOpen, Package, ShoppingBag, Boxes, ClipboardList, AlertTriangle,
} from 'lucide-react'
import api from '../lib/api'
import { getUser, getClinic } from '../lib/auth'

const ROLE_LABEL = { ADMIN: 'ผู้ดูแล', DOCTOR: 'แพทย์', ASSISTANT: 'ผู้ช่วย', STAFF: 'พนักงาน' }
const ROLE_COLOR = {
  ADMIN: 'bg-gray-100 text-gray-600',
  DOCTOR: 'bg-pink-100 text-pink-600',
  ASSISTANT: 'bg-purple-100 text-purple-600',
  STAFF: 'bg-blue-100 text-blue-600',
}

function Tile({ icon: Icon, label, value, tone = 'pink' }) {
  const tones = {
    pink: 'text-pink-600 bg-pink-50',
    purple: 'text-purple-600 bg-purple-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    amber: 'text-amber-600 bg-amber-50',
    gray: 'text-gray-600 bg-gray-100',
  }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-semibold text-gray-800 leading-none">{value ?? 0}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const me = getUser()
  const clinic = getClinic()

  useEffect(() => {
    // 👇 console.log ให้เห็นว่ากำลังใช้ admin คนไหนอยู่ (เปิด DevTools → Console)
    console.log('%c[ADMIN] current logged-in user:', 'color:#ec4899;font-weight:bold', me)
    console.table?.([{ id: me?.id, name: me?.name, email: me?.email, role: me?.role, clinic: clinic?.name }])

    api.get('/admin/overview')
      .then(r => {
        setData(r.data)
        console.log('%c[ADMIN] clinic overview:', 'color:#ec4899;font-weight:bold', r.data)
        console.log('[ADMIN] all users in clinic:')
        console.table?.(r.data.users)
      })
      .catch(e => setError(e.response?.data?.error || e.message))
  }, [])

  if (error) return <div className="p-6 text-sm text-red-500">โหลดข้อมูลไม่ได้: {error} (ต้องเป็น ADMIN เท่านั้น)</div>
  if (!data) return <div className="p-6 text-gray-400 text-sm">กำลังโหลด...</div>

  const { counts, users, rooms, products, materials, services, packages, recentAppointments, recentUsages } = data
  const lowMaterials = materials.filter(m => m.reorderLevel != null && m.stockQty <= m.reorderLevel)

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-lg bg-gray-800 text-white flex items-center justify-center"><Shield size={18} /></div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">แผงควบคุมผู้ดูแล (Admin)</h2>
          <p className="text-xs text-gray-400">
            {data.clinic?.name} · slug: {data.clinic?.slug} · เข้าใช้โดย {me?.name} ({me?.email})
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-6">💡 เปิด DevTools → Console เพื่อดู log ของ admin และข้อมูลทั้งหมด</p>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        <Tile icon={Stethoscope} label="แพทย์" value={counts.doctors} tone="pink" />
        <Tile icon={HeartHandshake} label="ผู้ช่วยแพทย์" value={counts.assistants} tone="purple" />
        <Tile icon={UserCog} label="พนักงาน" value={counts.staff} tone="blue" />
        <Tile icon={Shield} label="ผู้ดูแล" value={counts.admins} tone="gray" />
        <Tile icon={Users} label="คนไข้" value={counts.patients} tone="pink" />
        <Tile icon={Calendar} label="นัดหมาย" value={counts.appointments} tone="green" />
        <Tile icon={DoorOpen} label="ห้องบริการ" value={counts.rooms} tone="amber" />
        <Tile icon={Package} label="คอร์ส/แพ็กเกจ" value={counts.packages} tone="purple" />
        <Tile icon={ShoppingBag} label="สินค้า" value={counts.products} tone="blue" />
        <Tile icon={Boxes} label="วัสดุ" value={counts.materials} tone="amber" />
        <Tile icon={ClipboardList} label="รายการที่ใช้" value={counts.usages} tone="green" />
        <Tile icon={ClipboardList} label="บริการ" value={counts.services} tone="gray" />
      </div>

      {/* Low stock alert */}
      {lowMaterials.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700 font-medium">วัสดุใกล้หมด {lowMaterials.length} รายการ</p>
            <p className="text-xs text-amber-600">{lowMaterials.map(m => `${m.name} (${m.stockQty})`).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Users table */}
      <Section title="บุคลากรทั้งหมด" icon={Users}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-3 py-2 font-medium">ชื่อ</th>
                <th className="px-3 py-2 font-medium">บทบาท</th>
                <th className="px-3 py-2 font-medium">อีเมล</th>
                <th className="px-3 py-2 font-medium">ตำแหน่ง/ความเชี่ยวชาญ</th>
                <th className="px-3 py-2 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-2 text-gray-800">{u.name}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-500'}`}>{ROLE_LABEL[u.role] || u.role}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{u.email}</td>
                  <td className="px-3 py-2 text-gray-500">{u.specialty || u.position || '-'}</td>
                  <td className="px-3 py-2">
                    {u.active ? <span className="text-green-600 text-xs">ใช้งาน</span> : <span className="text-gray-400 text-xs">ปิด</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Recent appointments */}
      <Section title="นัดหมายล่าสุด" icon={Calendar}>
        {recentAppointments.length === 0 ? <Empty /> : (
          <div className="space-y-1.5">
            {recentAppointments.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 py-1.5">
                <span className="text-gray-800">{a.patient?.name}</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(a.startAt), 'd MMM HH:mm', { locale: th })}
                  {a.doctor ? ` · ${a.doctor.name}` : ''}{a.room ? ` · ${a.room.name}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Recent usages */}
      <Section title="รายการที่ใช้ล่าสุด" icon={ClipboardList}>
        {recentUsages.length === 0 ? <Empty /> : (
          <div className="space-y-1.5">
            {recentUsages.map(u => (
              <div key={u.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 py-1.5">
                <span className="text-gray-800">{u.name} <span className="text-gray-400">× {u.qty}</span></span>
                <span className="text-xs text-gray-400">{u.itemType === 'PRODUCT' ? 'สินค้า' : 'วัสดุ'} · {format(new Date(u.usedAt), 'd MMM', { locale: th })}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Inventory grids */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="สินค้า" icon={ShoppingBag}>
          <MiniList items={products} render={p => `${p.name} — คงเหลือ ${p.stockQty}${p.unit ? ' ' + p.unit : ''}`} />
        </Section>
        <Section title="วัสดุ" icon={Boxes}>
          <MiniList items={materials} render={m => `${m.name} — คงเหลือ ${m.stockQty}${m.unit ? ' ' + m.unit : ''}`} />
        </Section>
        <Section title="ห้องบริการ" icon={DoorOpen}>
          <MiniList items={rooms} render={r => `${r.name}${r.type ? ` (${r.type})` : ''}`} />
        </Section>
        <Section title="คอร์ส/แพ็กเกจ" icon={Package}>
          <MiniList items={packages} render={p => `${p.name} — ${p.totalSession} ครั้ง · ฿${p.price?.toLocaleString?.() ?? p.price}`} />
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"><Icon size={14} />{title}</h3>
      <div className="bg-white rounded-xl border border-gray-100 p-3">{children}</div>
    </div>
  )
}

function MiniList({ items, render }) {
  if (!items || items.length === 0) return <Empty />
  return (
    <ul className="space-y-1 text-sm text-gray-600">
      {items.map(it => <li key={it.id} className="border-b border-gray-50 last:border-0 py-1">{render(it)}</li>)}
    </ul>
  )
}

function Empty() { return <p className="text-xs text-gray-400 py-2">ยังไม่มีข้อมูล</p> }
