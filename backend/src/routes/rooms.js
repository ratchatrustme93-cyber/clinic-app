import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  const rooms = await prisma.room.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { name: 'asc' }
  })
  res.json(rooms)
})

router.post('/', auth, async (req, res) => {
  const { name, type, note } = req.body
  const room = await prisma.room.create({
    data: { clinicId: req.user.clinicId, name, type, note }
  })
  res.json(room)
})

router.put('/:id', auth, async (req, res) => {
  const { name, type, note, active } = req.body
  await prisma.room.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, type, note, active }
  })
  res.json({ ok: true })
})

router.delete('/:id', auth, async (req, res) => {
  await prisma.room.deleteMany({ where: { id: +req.params.id, clinicId: req.user.clinicId } })
  res.json({ ok: true })
})

export default router
