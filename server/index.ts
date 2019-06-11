import { prisma } from './generated/prisma-client';

async function main() {
  const newUser = await prisma.createUser({
    username: 'ar1a',
    password: 'admin123',
    meows: {
      create: [
        {
          content: 'My first tweet!'
        }
      ]
    }
  });
  console.log(`Created new user: ${newUser.username} (ID: ${newUser.id})`);

  const allUsers = await prisma.users();
  console.log(allUsers);

  const allMeows = await prisma.meows();
  console.log(allMeows);
}

main().catch(console.error);
