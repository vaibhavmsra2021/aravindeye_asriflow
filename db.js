// db.js
const { ReplitDB } = require('replit-db');
const db = new ReplitDB();

async function saveUser(emrId, userInfo) {
    await db.set(emrId, JSON.stringify(userInfo));
}

async function getUser(emrId) {
    const userInfo = await db.get(emrId);
    return userInfo ? JSON.parse(userInfo) : null;
}

module.exports = { saveUser, getUser };
