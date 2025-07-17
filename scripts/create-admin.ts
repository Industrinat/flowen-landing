import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  console.log('🔄 Creating admin user...')
  
  try {
    // Kolla om admin redan finns
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@flowen.se' }
    })

    if (existingUser) {
      console.log('✅ Admin user already exists')
      return existingUser
    }

    // Skapa admin user
    const passwordHash = await bcrypt.hash('flowen123', 10)
    
    const admin = await prisma.user.create({
      data: {
        id: 'admin-user-id', // Exakt samma som i JWT!
        email: 'admin@flowen.se',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User'
      }
    })

    console.log('✅ Admin user created:', admin.email)
    return admin

  } catch (error) {
    console.error('❌ Error creating admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))