import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { sendEmailReminder } from '../lib/email.js'

const router = Router()

// GET /api/appointments?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  const { date, patientId } = req.query
  const where = { clinicId: req.user.clinicId }

  if (date) {
    const start = new Date(date)
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    where.startAt = { gte: start, lt: end }
  }
  if (patientId) where.patientId = +patientId

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: { select: { id: true, name: true } },
      service: true
    },
    orderBy: { startAt: 'asc' }
  })
  res.json(appointments)
})

// GET /api/appointments/range?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/range', auth, async (req, res) => {
  const { from, to } = req.query
  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: req.user.clinicId,
      startAt: { gte: new Date(from), lte: new Date(to) }
    },
    include: {
      patient: true,
      doctor: { select: { id: true, name: true } },
      service: true
    },
    orderBy: { startAt: 'asc' }
  })
  res.json(appointments)
})

// GET /api/appointments/:id
router.get('/:id', auth, async (req, res) => {
  const appt = await prisma.appointment.findFirst({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    include: { patient: true, doctor: true, service: true }
  })
  if (!appt) return res.status(404).json({ error: 'Not found' })
  res.json(appt)
})

// POST /api/appointments
router.post('/', auth, async (req, res) => {
  const { patientId, doctorId, serviceId, startAt, endAt, note } = req.body
  const appt = await prisma.appointment.create({
    data: {
      clinicId: req.user.clinicId,
      patientId: +patientId,
      doctorId: doctorId ? +doctorId : null,
      serviceId: serviceId ? +serviceId : null,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      note
    },
    include: { patient: true, service: true }
  })
  res.json(appt)
})

// PUT /api/appointments/:id
router.put('/:id', auth, async (req, res) => {
  const appt = await prisma.appointment.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: {
      doctorId: req.body.doctorId ? +req.body.doctorId : undefined,
      serviceId: req.body.serviceId ? +req.body.serviceId : undefined,
      startAt: req.body.startAt ? new Date(req.body.startAt) : undefined,
      endAt: req.body.endAt ? new Date(req.body.endAt) : undefined,
      status: req.body.status,
      note: req.body.note,
      treatNote: req.body.treatNote
    }
  })
  res.json(appt)
})

// DELETE /api/appointments/:id
router.delete('/:id', auth, async (req, res) => {
  await prisma.appointment.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { status: 'CANCELLED' }
  })
  res.json({ ok: true })
})

// POST /api/appointments/:id/send-email
router.post('/:id/send-email', auth, async (req, res) => {
  const appt = await prisma.appointment.findFirst({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    include: { patient: true, service: true, clinic: true, doctor: true }
  })
  if (!appt) return res.status(404).json({ error: 'Not found' })
  if (!appt.patient.email) return res.status(400).json({ error: 'Patient has no email' })

  const result = await sendEmailReminder(appt)
  res.json(result)
})

export default router
