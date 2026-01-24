const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const jobIndexes = await mongoose.connection.db.collection('jobs').indexes();
        console.log('Job Indexes:', jobIndexes);

        const userIndexes = await mongoose.connection.db.collection('users').indexes();
        console.log('User Indexes:', userIndexes);

        process.exit(0);
    } catch (err) {
        console.error('Check Error:', err);
        process.exit(1);
    }
};

checkDB();
