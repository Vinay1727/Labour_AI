const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find users with malformed location and fix them
        // Either remove the location or set a valid default
        const result = await User.updateMany(
            {
                $or: [
                    { 'location.coordinates': { $exists: false } },
                    { 'location.coordinates': null },
                    { 'location.coordinates': { $size: 0 } },
                    { 'location.coordinates': { $size: 1 } }
                ]
            },
            {
                $set: {
                    'location.type': 'Point',
                    'location.coordinates': [0, 0]
                }
            }
        );

        console.log(`Fixed ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixData();
