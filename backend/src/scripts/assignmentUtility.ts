#!/usr/bin/env node
/**
 * Assignment Utility Script
 * 
 * This utility provides command-line access to the auto-assignment system.
 * It can be used to assign queries to teams manually or in batch.
 * 
 * Usage:
 *   npm run assign:single <queryId>     - Assign a single query
 *   npm run assign:all                  - Assign all unassigned queries
 *   npm run assign:stats                - Show assignment statistics
 *   npm run assign:reassign <queryId>   - Re-assign a query
 */

import { assignmentUtility } from '../services/assignmentUtility';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'single':
      case 'assign':
        if (!arg) {
          console.error('❌ Error: Query ID is required');
          console.log('Usage: npm run assign:single <queryId>');
          process.exit(1);
        }
        await assignSingle(arg);
        break;

      case 'all':
      case 'assign-all':
        await assignAll();
        break;

      case 'stats':
      case 'statistics':
        await showStats();
        break;

      case 'reassign':
        if (!arg) {
          console.error('❌ Error: Query ID is required');
          console.log('Usage: npm run assign:reassign <queryId>');
          process.exit(1);
        }
        await reassignQuery(arg);
        break;

      case 'filter':
        await assignByFilter();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error: any) {
    logger.error({ error }, 'Assignment utility error');
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

async function assignSingle(queryId: string) {
  console.log(`\n🔍 Assigning query: ${queryId}\n`);
  
  const result = await assignmentUtility.assignQuery(queryId);
  
  console.log('✅ Assignment successful!');
  console.log(`   Query ID: ${result.queryId}`);
  console.log(`   Team: ${result.assignment.teamName || 'Not assigned'}`);
  console.log(`   User: ${result.assignment.userName || 'Not assigned'}`);
  console.log(`   Priority: ${result.priority}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Reason: ${result.assignment.reason}\n`);
}

async function assignAll() {
  console.log('\n🔄 Assigning all unassigned queries...\n');
  
  const result = await assignmentUtility.assignAllUnassigned();
  
  console.log('✅ Batch assignment complete!');
  console.log(`   Total processed: ${result.processed}`);
  console.log(`   Successfully assigned: ${result.assigned}`);
  console.log(`   Skipped: ${result.skipped}`);
  console.log(`   Errors: ${result.errors}\n`);

  if (result.results.length > 0) {
    console.log('📊 Sample results (first 10):');
    result.results.slice(0, 10).forEach((r) => {
      if (r.success) {
        console.log(`   ✅ ${r.queryId.substring(0, 8)}... → ${r.teamName}`);
      } else {
        console.log(`   ❌ ${r.queryId.substring(0, 8)}... → ${r.error}`);
      }
    });
    if (result.results.length > 10) {
      console.log(`   ... and ${result.results.length - 10} more\n`);
    }
  }
}

async function showStats() {
  console.log('\n📊 Assignment Statistics\n');
  
  const stats = await assignmentUtility.getAssignmentStats();
  
  console.log(`Total Queries: ${stats.total}`);
  console.log(`Assigned: ${stats.assigned}`);
  console.log(`Unassigned: ${stats.unassigned}`);
  console.log(`\nBy Team:`);
  
  const sortedTeams = Object.entries(stats.byTeam).sort(([, a], [, b]) => b - a);
  sortedTeams.forEach(([team, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    console.log(`   ${team}: ${count} (${percentage}%)`);
  });
  
  if (stats.unassigned > 0) {
    const unassignedPercentage = ((stats.unassigned / stats.total) * 100).toFixed(1);
    console.log(`   Unassigned: ${stats.unassigned} (${unassignedPercentage}%)\n`);
  } else {
    console.log('   ✅ All queries are assigned!\n');
  }
}

async function reassignQuery(queryId: string) {
  console.log(`\n🔄 Re-assigning query: ${queryId}\n`);
  
  const result = await assignmentUtility.reassignQuery(queryId);
  
  console.log('✅ Re-assignment successful!');
  console.log(`   Query ID: ${result.queryId}`);
  console.log(`   Team: ${result.assignment.teamName || 'Not assigned'}`);
  console.log(`   User: ${result.assignment.userName || 'Not assigned'}`);
  console.log(`   Priority: ${result.priority}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Reason: ${result.assignment.reason}\n`);
}

async function assignByFilter() {
  console.log('\n🔍 Assigning queries by filter...\n');
  console.log('Note: This command requires filters. Use the API endpoint instead.');
  console.log('POST /api/assignment/assign-by-filter\n');
}

function showHelp() {
  console.log(`
📋 Assignment Utility - Help

Commands:
  assign:single <queryId>    Assign a single query to a team
  assign:all                 Assign all unassigned queries
  assign:stats               Show assignment statistics
  assign:reassign <queryId>  Re-assign a query (even if already assigned)
  assign:help                Show this help message

Examples:
  npm run assign:single abc123
  npm run assign:all
  npm run assign:stats
  npm run assign:reassign abc123

API Endpoints:
  POST   /api/assignment/assign/:queryId
  POST   /api/assignment/assign-all
  POST   /api/assignment/reassign/:queryId
  GET    /api/assignment/stats
  POST   /api/assignment/assign-by-filter
`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as assignmentUtilityCLI };

