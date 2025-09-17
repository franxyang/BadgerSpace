import { prisma } from '@/lib/prisma'

export type ScheduleItem = {
  code: string
  section?: string
  instructors: string[]
}

export async function upsertSchedule(term: string, items: ScheduleItem[]) {
  let offeringCount = 0
  let instructorLinks = 0
  for (const s of items) {
    const course = await prisma.course.findUnique({ where: { code: s.code } })
    if (!course) continue
    const offering = await prisma.offering.upsert({
      where: { courseId_term_section: { courseId: course.id, term, section: s.section || '' } },
      create: { courseId: course.id, term, section: s.section || null },
      update: {},
    })
    offeringCount++
    for (const name of s.instructors || []) {
      const trimmed = name.trim()
      if (!trimmed) continue
      const instr = await prisma.instructor.upsert({
        where: { name: trimmed },
        create: { name: trimmed },
        update: {},
      })
      await prisma.offeringInstructor.upsert({
        where: { offeringId_instructorId: { offeringId: offering.id, instructorId: instr.id } },
        create: { offeringId: offering.id, instructorId: instr.id },
        update: {},
      })
      await prisma.courseInstructor.upsert({
        where: { courseId_instructorId: { courseId: course.id, instructorId: instr.id } },
        create: { courseId: course.id, instructorId: instr.id },
        update: {},
      })
      instructorLinks++
    }
  }
  return { offeringCount, instructorLinks }
}

