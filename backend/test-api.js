const axios = require('axios');

const testSearch = async () => {
    try {
        // We need a token. Since I can't easily get one, I'll assume the server is running and try a public route or just see if it's alive.
        const res = await axios.get('http://localhost:5000/api/search?q=mistri&lat=28.6139&lng=77.2090', {
            headers: { Authorization: 'Bearer MOCK_TOKEN' } // This will fail with 401, but we want to see if it even reaches the controller
        });
        console.log('Response:', res.status);
    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Body:', err.response.data);
        } else {
            console.log('Error:', err.message);
        }
    }
};

testSearch();
