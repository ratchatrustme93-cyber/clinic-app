import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register-clinic — สร้างคลินิก + admin คนแรก
router.post('/register-clinic', async (req, res) => {
  const { clinicName, slug, email, password, name } = req.body
  try {
    const existing = await prisma.clinic.findUnique({ where: { slug } })
    if (existing) return res.status(400).json({ error: 'Slug already taken' })

    const hash = await bcrypt.hash(password, 10)
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        slug,
        users: {
          create: { name, email, password: hash, role: 'ADMIN' }
        }
      },
      include: { users: true }
    })
    const user = clinic.users[0]
    const token = jwt.sign(
      { id: user.id, clinicId: clinic.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, clinicId: clinic.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, slug } = req.body
  try {
    const clinic = await prisma.clinic.findUnique({ where: { slug } })
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' })

    const user = await prisma.user.findUnique({ where: { clinicId_email: { clinicId: clinic.id, email } } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, clinicId: clinic.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, clinicId: clinic.id, clinicName: clinic.name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { clinic: true }
  })
  res.json(user)
})

export default router
