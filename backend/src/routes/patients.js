import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import prisma from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (_, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
})
const upload = multer({ storage })

// GET /api/patients
router.get('/', auth, async (req, res) => {
  const { search } = req.query
  const patients = await prisma.patient.findMany({
    where: {
      clinicId: req.user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      })
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(patients)
})

// GET /api/patients/:id
router.get('/:id', auth, async (req, res) => {
  const patient = await prisma.patient.findFirst({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    include: {
      appointments: {
        include: { service: true, doctor: true },
        orderBy: { startAt: 'desc' }
      },
      patientPackages: {
        include: { package: true, sessions: { orderBy: { usedAt: 'desc' } } }
      },
      photos: { orderBy: { takenAt: 'desc' } }
    }
  })
  if (!patient) return res.status(404).json({ error: 'Not found' })
  res.json(patient)
})

// POST /api/patients
router.post('/', auth, async (req, res) => {
  const { name, phone, email, birthdate, gender, allergies, note } = req.body
  const count = await prisma.patient.count({ where: { clinicId: req.user.clinicId } })
  const code = `PT${String(count + 1).padStart(5, '0')}`
  const patient = await prisma.patient.create({
    data: {
      clinicId: req.user.clinicId,
      code, name, phone, email,
      birthdate: birthdate ? new Date(birthdate) : null,
      gender, allergies, note
    }
  })
  res.json(patient)
})

// PUT /api/patients/:id
router.put('/:id', auth, async (req, res) => {
  const { name, phone, email, birthdate, gender, allergies, note } = req.body
  const patient = await prisma.patient.updateMany({
    where: { id: +req.params.id, clinicId: req.user.clinicId },
    data: { name, phone, email, birthdate: birthdate ? new Date(birthdate) : null, gender, allergies, note }
  })
  res.json(patient)
})

// POST /api/patients/:id/photos
router.post('/:id/photos', auth, upload.single('photo'), async (req, res) => {
  const photo = await prisma.patientPhoto.create({
    data: {
      patientId: +req.params.id,
      url: `/uploads/${req.file.filename}`,
      label: req.body.label || null
    }
  })
  res.json(photo)
})

export default router
