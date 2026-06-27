import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  const services = await prisma.service.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { name: 'asc' }
  })
  res.json(services)
})

router.post('/', auth, async (req, res) => {
  const { name, description, price, durationMin } = req.body
  const service = await prisma.service.create({
    data: {
      clinicId: req.user.clinicId,
      name, description,
      price: price ? +price : null,
      durationMin: durationMin ? +durationMin : null
    }
  })
  res.json(service)
})

router.put('/:id', auth, async (req, res) => {
  const { name, description, price, durationMin } = req.body
  await prisma.service.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, description, price: price ? +price : null, durationMin: durationMin ? +durationMin : null }
  })
  res.json({ ok: true })
})

router.delete('/:id', auth, async (req, res) => {
  await prisma.service.deleteMany({ where: { id: +req.params.id, clinicId: req.user.clinicId } })
  res.json({ ok: true })
})

export default router
