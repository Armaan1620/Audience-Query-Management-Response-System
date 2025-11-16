import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

const teams = [
  { name: 'Support Team', description: 'General customer support team' },
  { name: 'Billing Team', description: 'Billing and payment inquiries' },
  { name: 'Technical Team', description: 'Technical support and bug reports' },
  { name: 'Operations Team', description: 'Operations and process management' },
  { name: 'Product Team', description: 'Product inquiries and feature requests' },
  { name: 'Escalations Team', description: 'Escalated issues and complex problems' },
];

const users = [
  { email: 'agent1@example.com', name: 'Agent One', role: 'agent', teamName: 'Support Team' },
  { email: 'agent2@example.com', name: 'Agent Two', role: 'agent', teamName: 'Billing Team' },
  { email: 'agent3@example.com', name: 'Agent Three', role: 'agent', teamName: 'Technical Team' },
  { email: 'agent4@example.com', name: 'Agent Four', role: 'agent', teamName: 'Operations Team' },
  { email: 'agent5@example.com', name: 'Agent Five', role: 'agent', teamName: 'Product Team' },
  { email: 'agent6@example.com', name: 'Agent Six', role: 'agent', teamName: 'Escalations Team' },
  { email: 'manager1@example.com', name: 'Manager One', role: 'manager', teamName: 'Support Team' },
  { email: 'manager2@example.com', name: 'Manager Two', role: 'manager', teamName: 'Technical Team' },
];

async function seedTeams() {
  try {
    logger.info('Starting team seeding...');

    for (const teamData of teams) {
      const existing = await prisma.team.findFirst({
        where: { name: teamData.name },
      });

      if (!existing) {
        const team = await prisma.team.create({
          data: {
            name: teamData.name,
            description: teamData.description,
          },
        });
        logger.info({ teamId: team.id, name: team.name }, 'Created team');
      } else {
        logger.info({ teamId: existing.id, name: existing.name }, 'Team already exists');
      }
    }

    for (const userData of users) {
      const team = await prisma.team.findFirst({
        where: { name: userData.teamName },
      });

      if (!team) {
        logger.warn({ teamName: userData.teamName }, 'Team not found for user');
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
        logger.info({ userId: user.id, name: user.name, team: team.name }, 'Created user');
      } else {
        logger.info({ email: userData.email }, 'User already exists');
      }
    }

    logger.info('Team seeding complete!');
  } catch (error) {
    logger.error({ error }, 'Error seeding teams');
    throw error;
  }
}

if (require.main === module) {
  seedTeams()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, 'Seeding failed');
      process.exit(1);
    });
}

export { seedTeams };

