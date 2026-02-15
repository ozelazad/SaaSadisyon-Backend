import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customers.upsert({
    where: { contact_email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Demo Restaurant',
      contact_email: 'owner@example.com',
      is_active: true,
      is_suspended: false,
      subscription_start: new Date(),
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const roles = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'];
  const roleRecords = {};
  for (const r of roles) {
    const rec = await prisma.roles.upsert({
      where: { id: `${customer.id}-${r}` },
      update: {},
      create: { id: `${customer.id}-${r}`, customer_id: customer.id, name: r },
    });
    roleRecords[r] = rec;
  }

  const managerPass = await bcrypt.hash('Passw0rd!', 12);
  await prisma.users.upsert({
    where: { email_customer_id: { email: 'manager@example.com', customer_id: customer.id } },
    update: { password: managerPass },
    create: {
      email: 'manager@example.com',
      password: managerPass,
      customer_id: customer.id,
      role_id: roleRecords.MANAGER.id,
    },
  });

  const tables = ['Table 1', 'Table 2', 'Garden 1'];
  for (const name of tables) {
    await prisma.tables.upsert({
      where: { id: `${customer.id}-${name}` },
      update: { name },
      create: { id: `${customer.id}-${name}`, customer_id: customer.id, name },
    });
  }

  const categories = await prisma.categories.create({ data: { customer_id: customer.id, name: 'Food' } });
  const drinks = await prisma.categories.create({ data: { customer_id: customer.id, name: 'Drinks' } });

  await prisma.products.createMany({
    data: [
      { id: `${customer.id}-p1`, customer_id: customer.id, category_id: categories.id, name: 'Burger', price: 1200 },
      { id: `${customer.id}-p2`, customer_id: customer.id, category_id: categories.id, name: 'Pizza', price: 1500 },
      { id: `${customer.id}-p3`, customer_id: customer.id, category_id: drinks.id, name: 'Cola', price: 300 },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded. Login with manager@example.com / Passw0rd! customer_id:', customer.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
