require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  const hash1 = await bcrypt.hash('pass123', 10);
  const hash2 = await bcrypt.hash('pass456', 10);

  const userId1 = new ObjectId();
  const userId2 = new ObjectId();
  await db.collection('users').insertMany([
    { _id: userId1, name: 'Ali Hassan', email: 'ali@example.com', passwordHash: hash1, createdAt: new Date() },
    { _id: userId2, name: 'Sara Khan', email: 'sara@example.com', passwordHash: hash2, createdAt: new Date() }
  ]);

  const proj1 = new ObjectId();
  const proj2 = new ObjectId();
  const proj3 = new ObjectId();
  const proj4 = new ObjectId();
  await db.collection('projects').insertMany([
    { _id: proj1, userId: userId1, name: 'Final Year Project', description: 'FYP research', archived: false, createdAt: new Date() },
    { _id: proj2, userId: userId1, name: 'DSA Assignment', description: 'Trees and graphs', archived: false, createdAt: new Date() },
    { _id: proj3, userId: userId2, name: 'Web Dev Portfolio', description: 'Personal site', archived: false, createdAt: new Date() },
    { _id: proj4, userId: userId2, name: 'Old Project', description: 'Archived', archived: true, createdAt: new Date() }
  ]);

  await db.collection('tasks').insertMany([
    { projectId: proj1, userId: userId1, title: 'Write proposal', status: 'done', priority: 1, tags: ['academic', 'writing'], subtasks: [{ title: 'Research background', done: true }, { title: 'Draft outline', done: false }], dueDate: new Date('2025-05-01'), createdAt: new Date() },
    { projectId: proj1, userId: userId1, title: 'Build prototype', status: 'in-progress', priority: 1, tags: ['coding'], subtasks: [{ title: 'Set up repo', done: true }, { title: 'Implement core', done: false }], createdAt: new Date() },
    { projectId: proj2, userId: userId1, title: 'Implement AVL tree', status: 'todo', priority: 2, tags: ['dsa', 'coding'], subtasks: [{ title: 'Read notes', done: false }], createdAt: new Date() },
    { projectId: proj3, userId: userId2, title: 'Design homepage', status: 'in-progress', priority: 1, tags: ['design', 'frontend'], subtasks: [{ title: 'Make wireframe', done: true }, { title: 'Write HTML', done: false }], createdAt: new Date() },
    { projectId: proj3, userId: userId2, title: 'Deploy to Vercel', status: 'todo', priority: 2, tags: ['deployment'], subtasks: [{ title: 'Create account', done: false }], createdAt: new Date() }
  ]);

  await db.collection('notes').insertMany([
    { userId: userId1, projectId: proj1, title: 'Meeting notes', content: 'Discussed scope with supervisor', tags: ['meeting'], createdAt: new Date() },
    { userId: userId1, projectId: proj2, title: 'AVL resources', content: 'Check CLRS chapter 13', tags: ['reference', 'dsa'], createdAt: new Date() },
    { userId: userId1, title: 'Random idea', content: 'Build a habit tracker app', tags: ['idea'], createdAt: new Date() },
    { userId: userId2, projectId: proj3, title: 'Design inspiration', content: 'Check dribbble for layouts', tags: ['design'], createdAt: new Date() },
    { userId: userId2, title: 'Books to read', content: 'Clean Code, SICP', tags: ['personal', 'reading'], createdAt: new Date() }
  ]);

  console.log('Seeded successfully!');
  await client.close();
}
seed().catch(console.error);
