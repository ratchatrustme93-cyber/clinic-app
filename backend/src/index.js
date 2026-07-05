import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import prisma from './lib/prisma.js'
import authRouter from './routes/auth.js'
import patientsRouter from './routes/patients.js'
import appointmentsRouter from './routes/appointments.js'
import packagesRouter from './routes/packages.js'
import servicesRouter from './routes/services.js'
import staffRouter from './routes/staff.js'
import roomsRouter from './routes/rooms.js'
import productsRouter from './routes/products.js'
import materialsRouter from './routes/materials.js'
import usagesRouter from './routes/usages.js'
import adminRouter from './routes/admin.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/packages', packagesRouter)
app.use('/api/services', servicesRouter)
app.use('/api/staff', staffRouter)
app.use('/api/rooms', roomsRouter)
app.use('/api/products', productsRouter)
app.use('/api/materials', materialsRouter)
app.use('/api/usages', usagesRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_, res) => res.json({ ok: true }))

// พิมพ์รายชื่อ Admin ทุกครั้งที่ start เพื่อดูว่ามี admin คนไหนบ้าง
async function logAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { clinic: { select: { name: true, slug: true } } },
      orderBy: { id: 'asc' },
    })
    console.log('\n===== ADMIN USERS =====')
    if (admins.length === 0) {
      console.log('  (ยังไม่มี admin — รัน `npm run db:seed` เพื่อสร้าง)')
    } else {
      admins.forEach(a =>
        console.log(`  #${a.id}  ${a.name} <${a.email}>  ·  clinic: ${a.clinic.name} (slug: ${a.clinic.slug})`)
      )
    }
    console.log('=======================\n')
  } catch (e) {
    console.error('logAdmins error:', e.message)
  }
}

const PORT = process.env.PORT || 3005
app.listen(PORT, async () => {
  console.log(`Clinic API running on :${PORT}`)
  await logAdmins()
})
