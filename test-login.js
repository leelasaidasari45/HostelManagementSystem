const axios = require('axios');

async function testLogin() {
  try {
    console.log("Testing new identifier payload...");
    const res1 = await axios.post('https://pg-backend-499c.onrender.com/api/auth/login', {
      identifier: 'leelasaidasari@gmail.com',
      password: '123456'
    });
    console.log("Success (identifier):", res1.data);
  } catch (err) {
    console.log("Failed (identifier):", err.response?.data || err.message);
  }

  try {
    console.log("Testing old email payload...");
    const res2 = await axios.post('https://pg-backend-499c.onrender.com/api/auth/login', {
      email: 'leelasaidasari@gmail.com',
      password: '123456'
    });
    console.log("Success (email):", res2.data);
  } catch (err) {
    console.log("Failed (email):", err.response?.data || err.message);
  }
}

testLogin();
