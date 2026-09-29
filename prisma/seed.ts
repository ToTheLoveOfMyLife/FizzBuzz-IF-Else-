import { PrismaClient, UserRole, WorkOrderPriority, WorkOrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(name: string, email: string, password: string, role: UserRole) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role, active: true, passwordHash: await bcrypt.hash(password, 12) },
    create: { name, email, role, passwordHash: await bcrypt.hash(password, 12) },
  });
}

async function main() {
  const admin = await upsertUser("Morgan Admin", "admin@fieldops.local", "DemoAdmin123!", UserRole.ADMIN);
  const dispatcher = await upsertUser(
    "Dana Dispatcher",
    "dispatcher@fieldops.local",
    "DemoDispatch123!",
    UserRole.DISPATCHER,
  );
  const technician = await upsertUser(
    "Taylor Technician",
    "tech@fieldops.local",
    "DemoTech123!",
    UserRole.TECHNICIAN,
  );

  const customer = await prisma.customer.upsert({
    where: { id: "demo-customer-1" },
    update: {},
    create: {
      id: "demo-customer-1",
      name: "Northstar Dental",
      contactName: "Jamie Carter",
      contactEmail: "jamie@northstar.example",
      phone: "555-0102",
      siteAddress: "125 Market Street",
    },
  });

  const secondCustomer = await prisma.customer.upsert({
    where: { id: "demo-customer-2" },
    update: {},
    create: {
      id: "demo-customer-2",
      name: "Riverbend Accounting",
      contactName: "Avery Brooks",
      contactEmail: "avery@riverbend.example",
      phone: "555-0144",
      siteAddress: "480 Commerce Drive",
    },
  });

  const existing = await prisma.workOrder.count();
  if (existing === 0) {
    await prisma.workOrder.createMany({
      data: [
        {
          ticketNumber: "WO-DEMO-1001",
          title: "Front office workstation cannot reach shared drive",
          description: "User can access the internet but mapped department drive fails after sign-in.",
          priority: WorkOrderPriority.HIGH,
          status: WorkOrderStatus.ASSIGNED,
          customerId: customer.id,
          assigneeId: technician.id,
          createdById: dispatcher.id,
        },
        {
          ticketNumber: "WO-DEMO-1002",
          title: "New employee technology setup",
          description: "Prepare workstation, email, MFA, printer access, and line-of-business applications.",
          priority: WorkOrderPriority.MEDIUM,
          status: WorkOrderStatus.OPEN,
          customerId: secondCustomer.id,
          createdById: admin.id,
        },
      ],
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
