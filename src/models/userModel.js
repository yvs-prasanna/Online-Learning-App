const database = require("../config/database"); 
const bcrypt = require('bcrypt');

const getUserByEmail = async (email) => {
    try {
        const getUserByEmailQuery = `SELECT * FROM users WHERE email = ?`;
        const result = await database.get(getUserByEmailQuery, [email]);
        return result; 
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error; 
    }
};

module.exports = {
    getUserByEmail,
};
