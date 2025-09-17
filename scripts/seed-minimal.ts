import { prisma } from '@/lib/prisma'

async function main() {
  const depts = ['MATH', 'CS', 'ECON']
  for (const code of depts) {
    await prisma.department.upsert({ where: { code }, create: { code, name: code }, update: {} })
  }
  const courses = [
    { code: 'MATH521', name: 'Real Analysis I', dept: 'MATH', credits: 3, level: 500 },
    { code: 'CS400', name: 'Programming III', dept: 'CS', credits: 3, level: 400 },
    { code: 'ECON101', name: 'Principles of Microeconomics', dept: 'ECON', credits: 3, level: 100 },
  ]
  for (const c of courses) {
    const d = await prisma.department.findUnique({ where: { code: c.dept } })
    await prisma.course.upsert({
      where: { code: c.code },
      create: { code: c.code, name: c.name, credits: c.credits, level: c.level, departmentId: d!.id },
      update: { name: c.name, credits: c.credits, level: c.level, departmentId: d!.id },
    })
  }
  // Seed example offerings for term suggestions
  const math = await prisma.course.findUnique({ where: { code: 'MATH521' } })
  if (math) {
    await prisma.offering.upsert({ where: { courseId_term_section: { courseId: math.id, term: '2025-Fall', section: '' } }, create: { courseId: math.id, term: '2025-Fall' }, update: {} })
    await prisma.offering.upsert({ where: { courseId_term_section: { courseId: math.id, term: '2025-Spring', section: '' } }, create: { courseId: math.id, term: '2025-Spring' }, update: {} })
  }
  console.log('Seeded minimal departments, courses, and offerings')
}

main().finally(async () => {
  await prisma.$disconnect()
})

