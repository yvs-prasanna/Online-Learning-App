const express = require("express");
const app = express();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {createJwtToken, createUser} = require("../models/authModel")
const {getUserByEmail} = require("../models/userModel");
const database = require("../config/database");

const registerAPI = async(req, res) => {
    const {username, email, password, mobile, targetExam, preferredLanguage, preparationLevel} = req.body;
    if(email === undefined || password === undefined || username === undefined){
        return res.status(400).json({message: "Please provide all required fields."});
    }
    try{
        const existingUser = await getUserByEmail(email);
        if(existingUser !== undefined){
            return res.status(400).json({message: "User already exists."});
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await createUser({username, email, hashedPassword, targetExam, preferredLanguage, preparationLevel})
            res.status(201).json({message: "User created successfully.", userId});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Internal Server Error."});
    }
}


const loginAPI = async(req, res) => {
    const {username, password, email, role} = req.body;
    if(!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if(email === process.env.ADMIN_EMAIL){
        return adminLogin(req, res)
    }
    if(role === "educator"){
        return educatorLogin(req, res);
    }

    try {
        const dbUser = await getUserByEmail(email);
        if(dbUser === undefined || dbUser.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        else{
            const jwtToken = await createJwtToken(dbUser, password);
            if(jwtToken !== null){
                return res.status(200).json({success: "true", message: 'Login successful', token: jwtToken , user: dbUser});
            }
            else{
                return res.status(400).json({ error: 'Invalid username or password' });
            }
        }
    } catch (error) {
        console.error('Login API error:', error);
        return res.status(500).json({ message: 'Internal Server Error during login.' });
    }
}

//Admin login
const adminLogin = async(req, res) => {
    const {username, password, email} = req.body;
    if(!email || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const dbUser = await getUserByEmail(email);
    try {
        if(dbUser === undefined || dbUser.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        else{
            const jwtToken = await createJwtToken(dbUser[0], password);
            if(jwtToken !== null){
                req.email = email
                return res.status(200).json({success: "true", message: 'Login successful', token: jwtToken , user: dbUser[0]});
            }
            else{
                return res.status(400).json({ error: 'Invalid username or password' });
            }
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ message: 'Internal Server Error during admin login.' });
    }

}

const registerEducator = async (req, res) => {
  try {
    const { name, email, password, mobile, subjects, qualification, experience, bio } = req.body;

    // Check if educator already exists
    const existingEducator = await database.get(
      'SELECT id FROM educators WHERE email = ?',
      [email]
    );

    if (existingEducator) {
      return res.status(409).json({
        success: false,
        message: 'Educator already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new educator
    const result = await database.run(
      `INSERT INTO educators (name, email, password_hash, mobile, subjects, qualification, experience, bio, years_experience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, mobile, JSON.stringify(subjects), qualification, experience, bio, experience]
    );
    res.status(201).json({
      success: true,
      message: 'Educator registration successful',
      educatorId: result.lastID,
      educator: {
        id: result.lastID,
        name,
        email,
        subjects,
        experience,
        isVerified: false
      }
    });

  } catch (error) {
    console.error('Educator registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Educator registration failed'
    });
  }
};

const educatorLogin = async(req, res) => {
    const {username, password, email} = req.body;
    if(!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if(email === process.env.ADMIN_EMAIL){
        return adminLogin(req, res)
    }
    const dbUserQuery = `SELECT * FROM educators WHERE email = ?`;
    try {
        const dbUser = await database.get(dbUserQuery, [email]);
        if(dbUser === undefined || dbUser.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        else{
            const jwtToken = await createJwtToken(dbUser, password);
            if(jwtToken !== null){
                return res.status(200).json({success: "true", message: 'Login successful', token: jwtToken , user: dbUser});
            }
            else{
                return res.status(400).json({ error: 'Invalid username or password' });
            }
        }
    } catch (error) {
        console.error('Educator login error:', error);
        return res.status(500).json({ message: 'Internal Server Error during educator login.' });
    }
};



module.exports = {registerAPI, loginAPI, adminLogin, registerEducator, educatorLogin};