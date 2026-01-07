const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/LABOUR_CHOWK';

async function checkDB() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        console.log('--- DATABASE STATUS ---');
        console.log('Database Name:', mongoose.connection.name);

        const users = await db.collection('users').find().sort({ createdAt: -1 }).limit(2).toArray();
        console.log('\nLatest Users:');
        users.forEach(u => console.log(`- ${u.name} (${u.role}) [ID: ${u._id}]`));

        const jobs = await db.collection('jobs').find().sort({ createdAt: -1 }).limit(2).toArray();
        console.log('\nLatest Jobs:');
        jobs.forEach(j => console.log(`- ${j.workType} (by: ${j.contractorId}) [ID: ${j._id}]`));

        const deals = await db.collection('deals').find().sort({ createdAt: -1 }).limit(2).toArray();
        console.log('\nLatest Deals:');
        deals.forEach(d => console.log(`- Deal for job ${d.jobId} [Status: ${d.status}]`));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkDB();
