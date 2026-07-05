import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { auth, requireRole } from '../middleware/auth.js'

const router = Router()

const SELECT = {
  id: true, name: true, email: true, role: true,
  phone: true, position: true, specialty: true, licenseNo: true,
  active: true, createdAt: true
}

// GET /api/staff?role=DOCTOR&active=1
router.get('/', auth, async (req, res) => {
  const { role, active } = req.query
  const where = { clinicId: req.user.clinicId }
  if (role) where.role = role
  if (active === '1') where.active = true

  const staff = await prisma.user.findMany({
    where,
    select: SELECT,
    orderBy: { name: 'asc' }
  })
  res.json(staff)
})

router.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  const { name, email, password, role, phone, position, specialty, licenseNo } = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      clinicId: req.user.clinicId,
      name, email, password: hash,
      role: role || 'STAFF',
      phone, position, specialty, licenseNo
    },
    select: SELECT
  })
  res.json(user)
})

router.put('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  const { name, role, phone, position, specialty, licenseNo, active } = req.body
  await prisma.user.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, role, phone, position, specialty, licenseNo, active }
  })
  res.json({ ok: true })
})

// Soft-deactivate (users are referenced by appointments, so we keep the record)
router.delete('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  await prisma.user.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { active: false }
  })
  res.json({ ok: true })
})

export default router
