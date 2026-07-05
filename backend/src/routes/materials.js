import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

const num = v => (v === '' || v === undefined || v === null ? null : +v)

router.get('/', auth, async (req, res) => {
  const materials = await prisma.material.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { name: 'asc' }
  })
  res.json(materials)
})

router.post('/', auth, async (req, res) => {
  const { name, sku, unit, cost, stockQty, reorderLevel, note } = req.body
  const material = await prisma.material.create({
    data: {
      clinicId: req.user.clinicId,
      name, sku, unit, note,
      cost: num(cost),
      stockQty: stockQty ? +stockQty : 0,
      reorderLevel: num(reorderLevel)
    }
  })
  res.json(material)
})

router.put('/:id', auth, async (req, res) => {
  const { name, sku, unit, cost, stockQty, reorderLevel, note } = req.body
  await prisma.material.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: {
      name, sku, unit, note,
      cost: num(cost),
      stockQty: stockQty === undefined ? undefined : +stockQty,
      reorderLevel: num(reorderLevel)
    }
  })
  res.json({ ok: true })
})

router.delete('/:id', auth, async (req, res) => {
  await prisma.material.deleteMany({ where: { id: +req.params.id, clinicId: req.user.clinicId } })
  res.json({ ok: true })
})

export default router
