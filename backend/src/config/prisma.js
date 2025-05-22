const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global; // helpful for dev (Hot Reloads)

let prisma;

if (!globalForPrisma.prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} else {
  prisma = globalForPrisma.prisma;
}

module.exports = prisma;
