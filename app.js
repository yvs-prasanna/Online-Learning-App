const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const database = require("./src/config/database");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const lessonRoutes = require("./src/routes/lessonRoutes");
const liveClassRoutes = require("./src/routes/liveClassRoutes");
const testsRoutes = require("./src/routes/testsRoutes");
const educatorRoutes = require("./src/routes/educatorRoutes");
const progressRoutes = require("./src/routes/progressRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");
const materialRoutes = require("./src/routes/materialRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const doubtRoutes = require("./src/routes/doubtRoutes");

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    await database.connect();
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
    throw error;
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/educators', educatorRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/', lessonRoutes);

const startServer = async () => {
  try{
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
  }
  }

startServer();

app.get("/users", async(req, res) => {
  console.log("Hello World")
  res.send("Hello World");
})
module.exports = app;
