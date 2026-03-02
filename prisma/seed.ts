import 'dotenv/config'
import { PrismaClient, CarStatus, Visibility, TransmissionType, DriveType, FuelType, BodyType, Condition } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Create admin user
  // TODO: Replace ADMIN_EMAIL and ADMIN_PASSWORD with real values in your .env before running seed
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@ecsendiautos.com'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe@2025!'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Ecsendia Admin',
      role: 'ADMIN',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create AI Search Config
  await prisma.aISearchConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      searchRadius: 50,
      city: 'Lagos',
      state: 'Lagos',
      minPrice: 2000,
      maxPrice: 20000,
      minYear: 2010,
      maxYear: 2024,
      maxMileage: 150000,
      keywords: ['clean title', 'well maintained', 'first body'],
      excludeKeywords: ['salvage', 'rebuilt', 'parts only', 'accident'],
      preferredMakes: ['Toyota', 'Honda', 'Lexus', 'Mercedes', 'BMW'],
      resultsPerDay: 20,
      minOpportunityScore: 60,
      emailNotifications: true,
      adminEmail: adminEmail,
      scheduledTime: '08:00',
      isActive: false,
    },
  })

  // Sample cars
  const cars = [
    {
      title: '2019 Toyota Camry SE',
      slug: '2019-toyota-camry-se-001',
      year: 2019,
      make: 'Toyota',
      model: 'Camry',
      trim: 'SE',
      price: 9500000,
      mileage: 52000,
      vin: '4T1B11HK8KU123456',
      exteriorColor: 'Midnight Black',
      interiorColor: 'Black',
      engine: '2.5L 4-Cylinder',
      transmission: TransmissionType.AUTOMATIC,
      driveType: DriveType.FWD,
      fuelType: FuelType.GAS,
      bodyType: BodyType.SEDAN,
      condition: Condition.CLEAN_TITLE,
      city: 'Lagos',
      state: 'Lagos',
      description: 'Excellent condition 2019 Toyota Camry SE. Single owner, full service history. Leather interior, backup camera, Apple CarPlay. No accidents. Ready to drive.',
      features: ['Leather Seats', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Bluetooth', 'Keyless Entry', 'Push Start', 'Cruise Control'],
      status: CarStatus.AVAILABLE,
      visibility: Visibility.PUBLISHED,
      featured: true,
    },
    {
      title: '2020 Honda CR-V EX',
      slug: '2020-honda-crv-ex-002',
      year: 2020,
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX',
      price: 13500000,
      mileage: 38000,
      exteriorColor: 'Lunar Silver',
      interiorColor: 'Gray',
      engine: '1.5L Turbocharged',
      transmission: TransmissionType.CVT,
      driveType: DriveType.AWD,
      fuelType: FuelType.GAS,
      bodyType: BodyType.SUV,
      condition: Condition.CLEAN_TITLE,
      city: 'Abuja',
      state: 'FCT',
      description: 'Beautiful 2020 Honda CR-V EX AWD. Panoramic sunroof, Honda Sensing safety suite, heated seats. Family-ready SUV in immaculate condition.',
      features: ['Panoramic Sunroof', 'Honda Sensing', 'Heated Seats', 'Wireless Charging', 'Apple CarPlay', 'Lane Keep Assist', 'Adaptive Cruise Control'],
      status: CarStatus.AVAILABLE,
      visibility: Visibility.PUBLISHED,
      featured: true,
    },
    {
      title: '2018 Lexus RX 350',
      slug: '2018-lexus-rx-350-003',
      year: 2018,
      make: 'Lexus',
      model: 'RX',
      trim: '350',
      price: 18000000,
      mileage: 65000,
      exteriorColor: 'Atomic Silver',
      interiorColor: 'Black',
      engine: '3.5L V6',
      transmission: TransmissionType.AUTOMATIC,
      driveType: DriveType.AWD,
      fuelType: FuelType.GAS,
      bodyType: BodyType.SUV,
      condition: Condition.CLEAN_TITLE,
      city: 'Port Harcourt',
      state: 'Rivers',
      description: 'Stunning 2018 Lexus RX 350 AWD. Premium package, Mark Levinson audio, navigation, ventilated seats. Nigerian used, meticulously maintained.',
      features: ['Mark Levinson Audio', 'Navigation', 'Ventilated Seats', 'Heated Seats', 'Blind Spot Monitor', 'Rear Cross Traffic Alert', 'Power Liftgate', 'Sunroof'],
      status: CarStatus.AVAILABLE,
      visibility: Visibility.PUBLISHED,
      featured: false,
    },
    {
      title: '2016 Toyota Corolla LE',
      slug: '2016-toyota-corolla-le-004',
      year: 2016,
      make: 'Toyota',
      model: 'Corolla',
      trim: 'LE',
      price: 5800000,
      mileage: 80000,
      exteriorColor: 'White',
      interiorColor: 'Beige',
      engine: '1.8L 4-Cylinder',
      transmission: TransmissionType.AUTOMATIC,
      driveType: DriveType.FWD,
      fuelType: FuelType.GAS,
      bodyType: BodyType.SEDAN,
      condition: Condition.CLEAN_TITLE,
      city: 'Lagos',
      state: 'Lagos',
      description: 'Reliable 2016 Toyota Corolla LE. Perfect first car or daily driver. Fuel efficient, clean title, well maintained. Toyota reliability at its best.',
      features: ['Backup Camera', 'Bluetooth', 'USB Input', 'Cruise Control', 'Keyless Entry', 'Power Windows'],
      status: CarStatus.AVAILABLE,
      visibility: Visibility.PUBLISHED,
      featured: false,
    },
    {
      title: '2021 Mercedes-Benz C300',
      slug: '2021-mercedes-benz-c300-005',
      year: 2021,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      trim: 'C300',
      price: 28500000,
      mileage: 22000,
      exteriorColor: 'Polar White',
      interiorColor: 'Black',
      engine: '2.0L Turbocharged',
      transmission: TransmissionType.AUTOMATIC,
      driveType: DriveType.RWD,
      fuelType: FuelType.GAS,
      bodyType: BodyType.SEDAN,
      condition: Condition.CLEAN_TITLE,
      city: 'Lagos',
      state: 'Lagos',
      description: 'Near-new 2021 Mercedes-Benz C300. AMG Line package, panoramic roof, Burmester audio, digital display cockpit. Ultimate luxury at your fingertips.',
      features: ['AMG Line Package', 'Panoramic Roof', 'Burmester Audio', 'Digital Cockpit', 'Heated Seats', 'Memory Seats', 'Park Assist', 'Ambient Lighting'],
      status: CarStatus.AVAILABLE,
      visibility: Visibility.PUBLISHED,
      featured: true,
    },
  ]

  for (const car of cars) {
    const created = await prisma.car.upsert({
      where: { slug: car.slug },
      update: {},
      create: {
        ...car,
        photos: {
          create: [
            {
              url: `https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800`,
              isMain: true,
              order: 0,
            },
          ],
        },
      },
    })
    console.log('Created car:', created.title)
  }

  console.log('\n✅ Seed complete!')
  console.log('\nAdmin credentials:')
  console.log(`  Email: ${adminEmail}`)
  console.log('\n⚠️  Change your admin password immediately after first login!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
