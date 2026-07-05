import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { auth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/admin/overview — สรุปทุกอย่างในคลินิก (ADMIN เท่านั้น)
router.get('/overview', auth, requireRole('ADMIN'), async (req, res) => {
  const clinicId = req.user.clinicId

  const [
    clinic, users, patientCount, appointmentCount, usageCount,
    rooms, services, packages, products, materials,
    recentPatients, recentAppointments, recentUsages,
  ] = await Promise.all([
    prisma.clinic.findUnique({ where: { id: clinicId } }),
    prisma.user.findMany({
      where: { clinicId },
      select: { id: true, name: true, email: true, role: true, active: true, phone: true, position: true, specialty: true, licenseNo: true },
      orderBy: { id: 'asc' },
    }),
    prisma.patient.count({ where: { clinicId } }),
    prisma.appointment.count({ where: { clinicId } }),
    prisma.treatmentUsage.count({ where: { clinicId } }),
    prisma.room.findMany({ where: { clinicId }, orderBy: { name: 'asc' } }),
    prisma.service.findMany({ where: { clinicId }, orderBy: { name: 'asc' } }),
    prisma.package.findMany({ where: { clinicId }, orderBy: { name: 'asc' } }),
    prisma.product.findMany({ where: { clinicId }, orderBy: { name: 'asc' } }),
    prisma.material.findMany({ where: { clinicId }, orderBy: { name: 'asc' } }),
    prisma.patient.findMany({ where: { clinicId }, orderBy: { id: 'desc' }, take: 10 }),
    prisma.appointment.findMany({
      where: { clinicId }, orderBy: { startAt: 'desc' }, take: 10,
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true } },
        assistant: { select: { name: true } },
        room: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.treatmentUsage.findMany({ where: { clinicId }, orderBy: { usedAt: 'desc' }, take: 10 }),
  ])

  const counts = {
    users: users.length,
    doctors: users.filter(u => u.role === 'DOCTOR').length,
    assistants: users.filter(u => u.role === 'ASSISTANT').length,
    staff: users.filter(u => u.role === 'STAFF').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    patients: patientCount,
    appointments: appointmentCount,
    rooms: rooms.length,
    services: services.length,
    packages: packages.length,
    products: products.length,
    materials: materials.length,
    usages: usageCount,
  }

  res.json({
    clinic, counts, users, rooms, services, packages, products, materials,
    recentPatients, recentAppointments, recentUsages,
  })
})

export default router
