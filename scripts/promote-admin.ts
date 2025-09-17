import { prisma } from '@/lib/prisma'

async function main() {
  const args = process.argv.slice(2)
  const idx = args.indexOf('--email')
  const email = idx >= 0 ? args[idx + 1] : ''
  if (!email) {
    console.error('Usage: admin:promote --email user@wisc.edu')
    process.exit(1)
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found. Ensure they have signed in at least once.')
    process.exit(1)
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } })
  console.log(`Promoted ${email} to ADMIN`)
}

main().finally(async () => {
  await prisma.$disconnect()
})

