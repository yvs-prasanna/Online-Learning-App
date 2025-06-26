const express = require('express');
const database = require("../config/database")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async(userData) => {
    const {username, email, hashedPassword, targetExam, preferredLanguage, preparationLevel} = userData;
    const createUserQuery = `insert into users (name, email,password_hash, target_exam, preferred_language, preparation_level) values (?,?,?, ?, ?, ?)`;
    const params = [username, email, hashedPassword, targetExam, preferredLanguage, preparationLevel];
    const result = await database.run(createUserQuery, params);
    return result.lastID;
}

const createJwtToken = async(dbUser, password) => {
    const {id, email, name, password_hash} = dbUser;
    const comparePassword = await bcrypt.compare(password, password_hash);
    if(comparePassword) {
        const jwtToken = jwt.sign({id, email,name}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return jwtToken;
    }
    else{
        return null;
    }
}

module.exports = {
    createUser,
    createJwtToken
}