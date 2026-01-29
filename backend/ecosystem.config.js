module.exports = {
    apps: [
        {
            name: 'labour-chowk-backend',
            script: 'dist/server.js',
            instances: 'max', // Use all available CPU cores
            exec_mode: 'cluster', // Enables clustering
            watch: false, // Set to true for auto-reload on file changes (not recommended for production)
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
