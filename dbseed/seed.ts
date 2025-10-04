import { AppDataSource } from '../src/data-source';
import { User } from '../src/user/user';
import { Order } from '../src/user/order';
import { OrderItem } from '../src/user/orderItem';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const orderRepo = AppDataSource.getRepository(Order);
  const itemRepo = AppDataSource.getRepository(OrderItem);

  // Configuration variables - adjust these to control seeding
  const numUsers = 1000;
  const numOrdersPerUser = 10;
  const numItemsPerOrder = 3;

  console.log('Starting database seeding...');

  // Clear existing data (in reverse order due to foreign keys)
  console.log('Clearing existing data...');
  await itemRepo.query('DELETE FROM "orderItem"');
  await orderRepo.query('DELETE FROM "orders"');
  await userRepo.query('DELETE FROM "users"');

  // Helper function to insert in batches
  async function insertInBatches(repo: any, data: any[], batchSize = 1000) {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await repo.insert(batch);
    }
  }

  // Seed users
  console.log(`Seeding ${numUsers} users...`);
  const users: { id: string; name: string; email: string }[] = [];
  const usedEmails = new Set<string>();
  for (let i = 0; i < numUsers; i++) {
    let email: string;
    do {
      email = faker.internet.email();
    } while (usedEmails.has(email));
    usedEmails.add(email);
    users.push({ id: randomUUID(), name: faker.person.fullName(), email });
  }
  await insertInBatches(userRepo, users);

  // Seed orders
  console.log(`Seeding ${numUsers * numOrdersPerUser} orders...`);
  const orders: { id: string; user: { id: string }; status: string; totalCost: number }[] = [];
  for (const user of users) {
    for (let j = 0; j < numOrdersPerUser; j++) {
      orders.push({
        id: randomUUID(),
        user: { id: user.id },
        status: faker.helpers.arrayElement(['pending', 'paid', 'shipped', 'cancelled']),
        totalCost: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      });
    }
  }
  await insertInBatches(orderRepo, orders);

  // Seed order items
  console.log(`Seeding ${numUsers * numOrdersPerUser * numItemsPerOrder} order items...`);
  const items: { id: string; order: { id: string }; quantity: number; unitPrice: number }[] = [];
  for (const order of orders) {
    for (let k = 0; k < numItemsPerOrder; k++) {
      items.push({
        id: randomUUID(),
        order: { id: order.id },
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitPrice: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
      });
    }
  }
  await insertInBatches(itemRepo, items);

  console.log('Seeding completed successfully!');
  console.log(`Created: ${users.length} users, ${orders.length} orders, ${items.length} order items`);

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});