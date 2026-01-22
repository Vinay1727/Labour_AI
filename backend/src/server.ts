import app from './app';
import { PORT } from './config/env';

import { connectDB } from './config/db';

const startServer = async () => {
    await connectDB();
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`Accepting connections on 0.0.0.0:${PORT}`);
    });
};

startServer();
