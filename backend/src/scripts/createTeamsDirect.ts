import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

async function createTeamsDirect() {
  try {
    logger.info('Creating teams directly...');

    const teams = [
      { name: 'Support', description: 'General customer support team' },
      { name: 'Billing', description: 'Billing and payment inquiries' },
      { name: 'Technical', description: 'Technical support and bug reports' },
      { name: 'Account', description: 'Account management and security' },
      { name: 'Sales', description: 'Sales and product inquiries' },
      { name: 'Social', description: 'Social media engagement team' },
      { name: 'Community', description: 'Community forum and discussions' },
    ];

    for (const teamData of teams) {
      try {
        const existing = await prisma.team.findFirst({
          where: { name: { equals: teamData.name, mode: 'insensitive' } },
        });

        if (!existing) {
          const team = await prisma.team.create({
            data: {
              name: teamData.name,
              description: teamData.description,
            },
          });
          console.log(`✅ Created team: ${team.name} (${team.id})`);
        } else {
          console.log(`ℹ️  Team already exists: ${existing.name}`);
        }
      } catch (error: any) {
        console.error(`❌ Error creating team ${teamData.name}:`, error.message);
      }
    }

    const users = [
      { email: 'agent1@example.com', name: 'Agent One', role: 'agent', teamName: 'Support' },
      { email: 'agent2@example.com', name: 'Agent Two', role: 'agent', teamName: 'Billing' },
      { email: 'agent3@example.com', name: 'Agent Three', role: 'agent', teamName: 'Technical' },
      { email: 'agent4@example.com', name: 'Agent Four', role: 'agent', teamName: 'Account' },
      { email: 'agent5@example.com', name: 'Agent Five', role: 'agent', teamName: 'Sales' },
      { email: 'agent6@example.com', name: 'Agent Six', role: 'agent', teamName: 'Social' },
      { email: 'agent7@example.com', name: 'Agent Seven', role: 'agent', teamName: 'Community' },
    ];

    for (const userData of users) {
      try {
        const team = await prisma.team.findFirst({
          where: { name: { equals: userData.teamName, mode: 'insensitive' } },
        });

        if (!team) {
          console.log(`⚠️  Team not found for user: ${userData.teamName}`);
          continue;
        }

        const existing = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (!existing) {
          const user = await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              role: userData.role,
              teamId: team.id,
            },
          });
          console.log(`✅ Created user: ${user.name} in ${team.name}`);
        } else {
          console.log(`ℹ️  User already exists: ${existing.email}`);
        }
      } catch (error: any) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n✅ Team creation complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTeamsDirect()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

