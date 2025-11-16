import generateBulkMessages from './bulkGenerator.js';

const count = Number(process.argv[2]) || 100;
generateBulkMessages({ count }).catch(console.error);
