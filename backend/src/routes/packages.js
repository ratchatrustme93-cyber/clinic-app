import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/packages — รายการ package template
router.get('/', auth, async (req, res) => {
  const packages = await prisma.package.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { createdAt: 'desc' }
  })
  res.json(packages)
})

// POST /api/packages
router.post('/', auth, async (req, res) => {
  const { name, description, totalSession, price, validDays } = req.body
  const pkg = await prisma.package.create({
    data: {
      clinicId: req.user.clinicId,
      name, description,
      totalSession: +totalSession,
      price: +price,
      validDays: validDays ? +validDays : null
    }
  })
  res.json(pkg)
})

// PUT /api/packages/:id
router.put('/:id', auth, async (req, res) => {
  const { name, description, totalSession, price, validDays } = req.body
  await prisma.package.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, description, totalSession: +totalSession, price: +price, validDays: validDays ? +validDays : null }
  })
  res.json({ ok: true })
})

// DELETE /api/packages/:id
router.delete('/:id', auth, async (req, res) => {
  await prisma.package.deleteMany({ where: { id: +req.params.id, clinicId: req.user.clinicId } })
  res.json({ ok: true })
})

// --- PatientPackage (คนไข้ซื้อคอร์ส) ---

// GET /api/packages/patient/:patientId
router.get('/patient/:patientId', auth, async (req, res) => {
  const pp = await prisma.patientPackage.findMany({
    where: { patientId: +req.params.patientId, clinicId: req.user.clinicId },
    include: {
      package: true,
      sessions: { orderBy: { usedAt: 'desc' } }
    },
    orderBy: { purchasedAt: 'desc' }
  })
  res.json(pp)
})

// POST /api/packages/patient — คนไข้ซื้อ package
router.post('/patient', auth, async (req, res) => {
  const { patientId, packageId, expiresAt } = req.body
  const pkg = await prisma.package.findFirst({
    where: { id: +packageId, clinicId: req.user.clinicId }
  })
  if (!pkg) return res.status(404).json({ error: 'Package not found' })

  const pp = await prisma.patientPackage.create({
    data: {
      clinicId: req.user.clinicId,
      patientId: +patientId,
      packageId: +packageId,
      sessionsTotal: pkg.totalSession,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    },
    include: { package: true }
  })
  res.json(pp)
})

// POST /api/packages/patient/:ppId/use — หัก 1 session
router.post('/patient/:ppId/use', auth, async (req, res) => {
  const pp = await prisma.patientPackage.findFirst({
    where: { id: +req.params.ppId, clinicId: req.user.clinicId }
  })
  if (!pp) return res.status(404).json({ error: 'Not found' })
  if (pp.sessionsUsed >= pp.sessionsTotal) {
    return res.status(400).json({ error: 'No sessions remaining' })
  }

  const [updated, session] = await prisma.$transaction([
    prisma.patientPackage.update({
      where: { id: pp.id },
      data: { sessionsUsed: { increment: 1 } }
    }),
    prisma.packageSession.create({
      data: { patientPackageId: pp.id, note: req.body.note || null }
    })
  ])
  res.json({ updated, session })
})

export default router
