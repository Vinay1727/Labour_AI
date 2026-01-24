const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));

        const badUsers = await User.find({
            $or: [
                { 'location.coordinates': { $exists: false } },
                { 'location.coordinates': null },
                { 'location.coordinates': { $size: 0 } },
                { 'location.coordinates': { $size: 1 } }
            ]
        });
        console.log('Bad Users (count):', badUsers.length);
        if (badUsers.length > 0) {
            console.log('Sample Bad User IDs:', badUsers.slice(0, 5).map(u => u._id));
        }

        const badJobs = await Job.find({
            $or: [
                { 'location.coordinates': { $exists: false } },
                { 'location.coordinates': null },
                { 'location.coordinates': { $size: 0 } },
                { 'location.coordinates': { $size: 1 } }
            ]
        });
        console.log('Bad Jobs (count):', badJobs.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
