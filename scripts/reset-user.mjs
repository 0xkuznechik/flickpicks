import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetUser(email) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { picks: true }
    })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }

    console.log(`📋 Found user: ${user.email}`)
    console.log(`   - Current picks: ${user.picks.length}`)

    // Delete all picks for this user
    const deleted = await prisma.pick.deleteMany({
      where: { userId: user.id }
    })

    console.log(`✅ Deleted ${deleted.count} picks for ${email}`)
    console.log(`🎉 User ${email} has been reset!`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: node scripts/reset-user.mjs <email>')
  console.log('Example: node scripts/reset-user.mjs user1@example.com')
  process.exit(1)
}

resetUser(email)
