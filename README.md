
---

# 📚 E-Learning App

An advanced Node.js-based backend API for an E-Learning platform. This app supports user registration, course enrollment, lessons, tests, live classes, doubt-solving, subscriptions, and more.

---

## 🚀 Features

- 🔐 User Authentication (Register/Login)
- 🎓 Course Listing, Reviews, Enrollments
- 📘 Lessons & Progress Tracking
- 💬 Doubt Posting & Answering
- 🧑‍🏫 Educator Profiles & Following
- 📺 Live Class Participation
- 📄 Material Downloads
- 🧪 Test Creation, Submission, Evaluation
- 🔍 Global Search Functionality
- 💎 Subscription Plan Handling

---

## ⚙️ Prerequisites & Setup

### ✅ 1. Install Dependencies
npm install

### ✅ 2. **Setup Database**
npm run setup

### ✅ 3. Run the Server
npm run dev

🔗 Postman Collection
File: Postman Collection.json
 1. Open Postman
 2. Click Import
 3. Upload the .json file
 4. Use requests organized by folders (Auth, Courses, Lessons, etc.)

## 🚀 Authentication

### 🔐 Register

**POST** `/api/auth/register`

#### 📝 Request Body
```json
{
  "username": "dennis",
  "email": "dennis@gmail.com",
  "password": "123456",
  "mobile": "1234567891",
  "targetExam": "JEE",
  "preferredLanguage": "English",
  "preparationLevel": "Great"
}
```
  
  Registers a new user with details like username, email, password, mobile, target exam, preferred language, and preparation level.

- **Login**  
  `POST /api/auth/login`
  
#### 📝 Request Body
```json
{
  "username": "dennis",
  "email": "dennis@gmail.com",
  "password": "123456",
  "mobile": "1234567891",
  "targetExam": "JEE",
  "preferredLanguage": "English",
  "preparationLevel": "Great"
}
```
  Logs in an existing user and returns a JWT token.

---

## 🎓 Courses

- **Get All Courses**  
  `GET /api/courses/courses`  

- **Get Single Course**  
  `GET /api/courses/courses/:id`  

- **Enroll in a Course**  
  `POST /api/courses/courses/:id/enroll`

- **Post Course Review**  
  `POST /api/courses/courses/:id/review`

  
  #### 📝 Request Body
```json
{
    "rating" : "4.5",
    "review" : "Excellent Teaching"
}
```

  Submit rating and review.

---

## 📘 Lessons

- **Get Lesson**  
  `GET /api/lessons/:id`  

- **Update Lesson Progress**  
  `PUT /api/lessons/:id/progress`

  #### 📝 Request Body
```json
{
    "watchedDuration": 1350,
    "totalDuration": 2700,
    "completed": false
}
```



- **Save Lesson Notes**  
  `POST /api/lessons/:id/notes`

  #### 📝 Request Body
```json
{
    "timestamp": 845,
    "note": "Important formula: F = ma"
}
```

---

## 🧑‍🏫 Live Classes

- **Join Live Class**  
  `POST /api/live-classes/:id/join`  

- **Get Live Class Questions**  
  `GET /api/live-classes/:id/questions`  

- **Get Live Class Schedule**  
  `GET /api/live-classes/schedule`  

---

## 🧪 Tests

- **Get Tests for Course**  
  `GET /api/tests/tests?courseId={courseId}`  

- **Start Test**  
  `POST /api/tests/tests/:id/start`  

- **Submit Test Answers**  
  `POST /api/tests/tests/:sessionId/submit`

   #### 📝 Request Body
```json
{
    "answers": [
        {
            "questionId": 1,
            "selectedOption": 2
        }
    ],
    "timeSpent": 9500
}
```

---

## 🧑‍🎓 Educators

- **Get All Educators**  
  `GET /api/educators/educators`  

- **Get Educator Profile**  
  `GET /api/educators/educators/:id`  

- **Follow Educator**  
  `POST /api/educators/educators/:id/follow`  

---

## 📊 Progress Tracking

- **Get Learning Dashboard**  
  `GET /api/progress/dashboard`  

- **Get Course Progress**  
  `GET /api/progress/course/:id`  

---

## 💎 Subscription

- **Get Subscription Plans**  
  `GET /api/subscriptions/plans`  

- **Purchase Subscription**  
  `POST /api/subscriptions/purchase`

     #### 📝 Request Body
```json
{
    "planId" : 3,
    "paymentMethod" : "UPI",
    "paymentId" : 1
}
```

---

## ❓ Doubts & Discussions

- **Get My Doubts**  
  `GET /api/doubts/my-doubts`  

- **Post a Doubt**  
  `POST /api/doubts/doubt`

  #### 📝 Request Body
```json
{
    "courseId": 2,
    "lessonId": 1,
    "question": "Why is acceleration constant in free fall?",
    "attachments": ["image_url"]
}
```

- **Answer a Doubt**  
  `POST /api/doubts/doubt/:doubtId/answer`
  
   #### 📝 Request Body
```json
{
    "answer" : "You have read the concept first.",
    "attachments" : "www.google.com",
    "role" : "user"
}
```

---

## 🔍 Global Search

- **Search Across Courses, Lessons, Materials, etc.**  
  `GET /api/search/search?q=keyword`  

---

## 📂 Materials

- **Get Course Materials**  
  `GET /api/materials/course/:id`  

- **Download Material**  
  `GET /api/materials/:id/download`  

---

## 🛡️ Authorization

Most endpoints require an `Authorization` header with a valid JWT:
```http
Authorization: Bearer <your_token_here>

