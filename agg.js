require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  const users = await db.collection('users').find().toArray();
  const ownerId = users[0]._id;

  const result = await db.collection('tasks').aggregate([
    { $match: { userId: ownerId } },
    { $group: { _id: '$projectId', todo: { $sum: { $cond: [{ $eq: ['$status','todo'] }, 1, 0] } }, inProgress: { $sum: { $cond: [{ $eq: ['$status','in-progress'] }, 1, 0] } }, done: { $sum: { $cond: [{ $eq: ['$status','done'] }, 1, 0] } }, total: { $sum: 1 } } },
    { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
    { $unwind: '$project' },
    { $project: { _id: 1, projectName: '$project.name', todo: 1, inProgress: 1, done: 1, total: 1 } }
  ]).toArray();

  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.error);
