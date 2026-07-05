import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/usages?appointmentId= | ?patientId=
router.get('/', auth, async (req, res) => {
  const { appointmentId, patientId } = req.query
  const where = { clinicId: req.user.clinicId }
  if (appointmentId) where.appointmentId = +appointmentId
  if (patientId) where.patientId = +patientId

  const usages = await prisma.treatmentUsage.findMany({
    where,
    orderBy: { usedAt: 'desc' }
  })
  res.json(usages)
})

// POST /api/usages  { appointmentId, itemType: PRODUCT|MATERIAL, productId|materialId, qty, note }
// Records what was used on a patient during an appointment and decrements stock.
router.post('/', auth, async (req, res) => {
  const { appointmentId, itemType, productId, materialId, qty, note } = req.body
  const clinicId = req.user.clinicId
  const quantity = qty ? +qty : 1

  const appt = await prisma.appointment.findFirst({
    where: { id: +appointmentId, clinicId }
  })
  if (!appt) return res.status(404).json({ error: 'Appointment not found' })

  if (itemType !== 'PRODUCT' && itemType !== 'MATERIAL') {
    return res.status(400).json({ error: 'itemType must be PRODUCT or MATERIAL' })
  }

  try {
    const usage = await prisma.$transaction(async tx => {
      let name, unitCost
      if (itemType === 'PRODUCT') {
        const item = await tx.product.findFirst({ where: { id: +productId, clinicId } })
        if (!item) throw new Error('Product not found')
        name = item.name
        unitCost = item.cost
        await tx.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: quantity } }
        })
      } else {
        const item = await tx.material.findFirst({ where: { id: +materialId, clinicId } })
        if (!item) throw new Error('Material not found')
        name = item.name
        unitCost = item.cost
        await tx.material.update({
          where: { id: item.id },
          data: { stockQty: { decrement: quantity } }
        })
      }

      return tx.treatmentUsage.create({
        data: {
          clinicId,
          appointmentId: appt.id,
          patientId: appt.patientId,
          itemType,
          productId: itemType === 'PRODUCT' ? +productId : null,
          materialId: itemType === 'MATERIAL' ? +materialId : null,
          name,
          qty: quantity,
          unitCost,
          note
        }
      })
    })
    res.json(usage)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// DELETE /api/usages/:id  — removes the record and restores stock
router.delete('/:id', auth, async (req, res) => {
  const clinicId = req.user.clinicId
  const usage = await prisma.treatmentUsage.findFirst({
    where: { id: +req.params.id, clinicId }
  })
  if (!usage) return res.status(404).json({ error: 'Not found' })

  await prisma.$transaction(async tx => {
    if (usage.itemType === 'PRODUCT' && usage.productId) {
      await tx.product.update({
        where: { id: usage.productId },
        data: { stockQty: { increment: usage.qty } }
      })
    } else if (usage.itemType === 'MATERIAL' && usage.materialId) {
      await tx.material.update({
        where: { id: usage.materialId },
        data: { stockQty: { increment: usage.qty } }
      })
    }
    await tx.treatmentUsage.delete({ where: { id: usage.id } })
  })
  res.json({ ok: true })
})

export default router
