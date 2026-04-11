const axios = require('axios');

async function testRegistration() {
    const registrationData = {
        phone: '0000000000',
        email: 'finaltest@example.com',
        full_name: 'Final Test User',
        password: 'password123',
        role_code: 'customer',
        district_id: null,
        subdivision_id: null
    };

    try {
        console.log('Attempting final test registration...');
        const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);
        console.log('Registration successful:', response.data);
    } catch (error) {
        console.error('Registration failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegistration();
