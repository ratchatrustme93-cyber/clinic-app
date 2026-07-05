import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../src/lib/prisma.js'

// ตารางเรียงลำดับให้ TRUNCATE...CASCADE เคลียร์ได้ทั้งหมด (รีเซ็ต id ด้วย)
const TABLES = [
  'TreatmentUsage', 'EmailLog', 'PackageSession', 'PatientPackage',
  'Appointment', 'PatientPhoto', 'Patient', 'Product', 'Material',
  'Room', 'Service', 'Package', 'User', 'Clinic',
]

// บัญชี Admin เริ่มต้น — แก้ได้ตามต้องการ
const ADMIN = {
  clinicName: 'ClinicOS Demo',
  slug: 'demo',
  name: 'Super Admin',
  email: 'admin@clinic.local',
  password: 'admin1234',
}

async function main() {
  console.log('🧹 กำลังล้างฐานข้อมูล (clearing database)...')
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
  )
  console.log('✅ ล้างข้อมูลทุกตารางเรียบร้อย\n')

  const hash = await bcrypt.hash(ADMIN.password, 10)
  const clinic = await prisma.clinic.create({
    data: {
      name: ADMIN.clinicName,
      slug: ADMIN.slug,
      users: {
        create: { name: ADMIN.name, email: ADMIN.email, password: hash, role: 'ADMIN' },
      },
    },
    include: { users: true },
  })
  const admin = clinic.users[0]

  console.log('┌──────────────────────────────────────────────┐')
  console.log('│           ADMIN USER (seed created)          │')
  console.log('├──────────────────────────────────────────────┤')
  console.log(`│  id        : ${admin.id}`)
  console.log(`│  ชื่อ/name  : ${admin.name}`)
  console.log(`│  email     : ${admin.email}`)
  console.log(`│  password  : ${ADMIN.password}   (plain, ใช้ login)`)
  console.log(`│  role      : ${admin.role}`)
  console.log(`│  clinic    : ${clinic.name}`)
  console.log(`│  slug      : ${clinic.slug}   (ใช้ตอน login)`)
  console.log('└──────────────────────────────────────────────┘')
  console.log('\n👉 เข้าระบบที่ http://localhost:5173/login ด้วย slug + email + password ด้านบน')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
