const { ObjectId } = require('mongodb');

async function signupUser(db, userData) {
  return db.collection('users').insertOne({ name: userData.name, email: userData.email, passwordHash: userData.passwordHash, createdAt: new Date() });
}

async function loginFindUser(db, email) {
  return db.collection('users').findOne({ email });
}

async function listUserProjects(db, ownerId) {
  return db.collection('projects').find({ userId: new ObjectId(ownerId), archived: false }).sort({ createdAt: -1 }).toArray();
}

async function createProject(db, projectData) {
  return db.collection('projects').insertOne({ userId: new ObjectId(projectData.ownerId), name: projectData.name, description: projectData.description || '', archived: false, createdAt: new Date() });
}

async function archiveProject(db, projectId) {
  return db.collection('projects').updateOne({ _id: new ObjectId(projectId) }, { $set: { archived: true } });
}

async function listProjectTasks(db, projectId, status) {
  const filter = { projectId: new ObjectId(projectId) };
  if (status) filter.status = status;
  return db.collection('tasks').find(filter).sort({ priority: -1, createdAt: -1 }).toArray();
}

async function createTask(db, taskData) {
  return db.collection('tasks').insertOne({ userId: new ObjectId(taskData.ownerId), projectId: new ObjectId(taskData.projectId), title: taskData.title, status: 'todo', priority: taskData.priority !== undefined ? taskData.priority : 1, tags: taskData.tags || [], subtasks: taskData.subtasks || [], createdAt: new Date() });
}

async function updateTaskStatus(db, taskId, newStatus) {
  return db.collection('tasks').updateOne({ _id: new ObjectId(taskId) }, { $set: { status: newStatus } });
}

async function addTaskTag(db, taskId, tag) {
  return db.collection('tasks').updateOne({ _id: new ObjectId(taskId) }, { $addToSet: { tags: tag } });
}

async function removeTaskTag(db, taskId, tag) {
  return db.collection('tasks').updateOne({ _id: new ObjectId(taskId) }, { $pull: { tags: tag } });
}

async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  return db.collection('tasks').updateOne({ _id: new ObjectId(taskId), 'subtasks.title': subtaskTitle }, { $set: { 'subtasks.$.done': newDone } });
}

async function deleteTask(db, taskId) {
  return db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });
}

async function searchNotes(db, ownerId, tags, projectId) {
  const filter = { userId: new ObjectId(ownerId) };
  if (tags && tags.length > 0) filter.tags = { $in: tags };
  if (projectId) filter.projectId = new ObjectId(projectId);
  return db.collection('notes').find(filter).sort({ createdAt: -1 }).toArray();
}

async function projectTaskSummary(db, ownerId) {
  return db.collection('tasks').aggregate([
    { $match: { userId: new ObjectId(ownerId) } },
    { $group: { _id: '$projectId', todo: { $sum: { $cond: [{ $eq: ['$status','todo'] }, 1, 0] } }, inProgress: { $sum: { $cond: [{ $eq: ['$status','in-progress'] }, 1, 0] } }, done: { $sum: { $cond: [{ $eq: ['$status','done'] }, 1, 0] } }, total: { $sum: 1 } } },
    { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
    { $unwind: '$project' },
    { $project: { _id: 1, projectName: '$project.name', todo: 1, inProgress: 1, done: 1, total: 1 } }
  ]).toArray();
}

async function recentActivityFeed(db, ownerId) {
  return db.collection('tasks').aggregate([
    { $match: { userId: new ObjectId(ownerId) } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
    { $unwind: '$project' },
    { $project: { _id: 1, title: 1, status: 1, priority: 1, createdAt: 1, projectId: 1, projectName: '$project.name' } }
  ]).toArray();
}

module.exports = { signupUser, loginFindUser, listUserProjects, createProject, archiveProject, listProjectTasks, createTask, updateTaskStatus, addTaskTag, removeTaskTag, toggleSubtask, deleteTask, searchNotes, projectTaskSummary, recentActivityFeed };
