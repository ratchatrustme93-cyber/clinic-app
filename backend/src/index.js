import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRouter from './routes/auth.js'
import patientsRouter from './routes/patients.js'
import appointmentsRouter from './routes/appointments.js'
import packagesRouter from './routes/packages.js'
import servicesRouter from './routes/services.js'
import staffRouter from './routes/staff.js'

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

app.get('/api/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3005
app.listen(PORT, () => console.log(`Clinic API running on :${PORT}`))
