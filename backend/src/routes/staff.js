import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { auth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  const staff = await prisma.user.findMany({
    where: { clinicId: req.user.clinicId },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })
  res.json(staff)
})

router.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  const { name, email, password, role } = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { clinicId: req.user.clinicId, name, email, password: hash, role: role || 'STAFF' }
  })
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

router.put('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  const { name, role } = req.body
  await prisma.user.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, role }
  })
  res.json({ ok: true })
})

export default router
