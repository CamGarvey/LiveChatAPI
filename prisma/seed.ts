import { PrismaClient, User } from '@prisma/client';
import users from './data';

const loadUsers = async (prisma: PrismaClient) => {
  await prisma.user.createMany({
    data: users,
  });

  const otherUsers = await prisma.user.findMany();

  const masterUser = await prisma.user.create({
    data: {
      email: 'cam.garvey11@gmail.com',
      name: 'Cameron g',
      username: 'Camgaroo',
      friends: {
        connect: otherUsers.map(({ id }) => ({ id })),
      },
      friendsOf: {
        connect: otherUsers.map(({ id }) => ({ id })),
      },
    },
  });
  return { masterUser, otherUsers };
};

const loadChats = async (
  prisma: PrismaClient,
  masterUser: User,
  otherUsers: User[],
) => {
  const chatFun = await prisma.chat.create({
    data: {
      type: 'GROUP',
      name: 'FUN',
      createdBy: {
        connect: {
          id: masterUser.id,
        },
      },
      event: {
        create: [
          {
            type: 'MESSAGE',
            message: {
              create: {
                content: 'Sup',
              },
            },
            createdBy: {
              connect: {
                id: masterUser.id,
              },
            },
          },
        ],
      },
      members: {
        createMany: {
          data: [...otherUsers, masterUser].map((x) => ({
            userId: x.id,
            role: x.id === masterUser.id ? 'OWNER' : 'BASIC',
            addedById: masterUser.id,
          })),
        },
      },
    },
  });
  const chatBoring = await prisma.chat.create({
    data: {
      name: 'BORING',
      type: 'GROUP',
      createdBy: {
        connect: {
          id: masterUser.id,
        },
      },
      members: {
        createMany: {
          data: [...otherUsers, masterUser].map((x) => ({
            userId: x.id,
            role: x.id === masterUser.id ? 'OWNER' : 'BASIC',
            addedById: masterUser.id,
          })),
        },
      },
      event: {
        create: [
          {
            type: 'MESSAGE',
            createdBy: {
              connect: {
                id: masterUser.id,
              },
            },
            message: {
              create: {
                content: 'Yo',
              },
            },
          },
        ],
      },
    },
  });
  return [chatFun, chatBoring];
};

const loadAll = async (prisma: PrismaClient) => {
  try {
    const { masterUser, otherUsers } = await loadUsers(prisma);
    await loadChats(prisma, masterUser, otherUsers);
    console.log('Database seeded');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

loadAll(new PrismaClient());
