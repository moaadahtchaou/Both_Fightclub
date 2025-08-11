const axios = require('axios');

const createSuperAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/register', {
      username: 'Bunny#9332',
      password: 'moaad073022+',
      role: 'admin'
    });
    
    console.log('Superadmin created successfully!');
    console.log('Username: Bunny#9332');
    console.log('Password: moaad073022+');
    console.log('Role: admin');
  } catch (error) {
    if (error.response && error.response.data.msg === 'User already exists') {
      console.log('Superadmin already exists!');
    } else {
      console.error('Error creating superadmin:', error.response?.data || error.message);
    }
  }
};

createSuperAdmin();