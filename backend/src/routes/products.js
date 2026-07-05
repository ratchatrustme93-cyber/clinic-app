import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

const num = v => (v === '' || v === undefined || v === null ? null : +v)

router.get('/', auth, async (req, res) => {
  const products = await prisma.product.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { name: 'asc' }
  })
  res.json(products)
})

router.post('/', auth, async (req, res) => {
  const { name, sku, category, unit, price, cost, stockQty, note } = req.body
  const product = await prisma.product.create({
    data: {
      clinicId: req.user.clinicId,
      name, sku, category, unit, note,
      price: num(price),
      cost: num(cost),
      stockQty: stockQty ? +stockQty : 0
    }
  })
  res.json(product)
})

router.put('/:id', auth, async (req, res) => {
  const { name, sku, category, unit, price, cost, stockQty, note } = req.body
  await prisma.product.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: {
      name, sku, category, unit, note,
      price: num(price),
      cost: num(cost),
      stockQty: stockQty === undefined ? undefined : +stockQty
    }
  })
  res.json({ ok: true })
})

router.delete('/:id', auth, async (req, res) => {
  await prisma.product.deleteMany({ where: { id: +req.params.id, clinicId: req.user.clinicId } })
  res.json({ ok: true })
})

export default router
