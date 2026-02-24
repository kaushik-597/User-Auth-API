# User Authentication API 🔐

A secure and scalable authentication and user management API built with Node.js, Express, and MongoDB.

This project focuses on mastering authentication architecture, token handling, middleware design, and secure file uploads.

---

## 🚀 Features

- User Registration
- Secure Login & Logout
- JWT Authentication (Access & Refresh Tokens)
- Refresh Token Rotation
- Change / Reset Password
- Get Current User
- Update User Details
- Update Avatar (Cloudinary Integration)
- Update Cover Image (Cloudinary Integration)
- Protected Routes with Middleware
- Cookie-Based Authentication
- Health Check Endpoint

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- cookie-parser
- Multer
- Cloudinary

---

## 📂 Project Structure

```
src/
│
├── archive/
├── controllers/
├── db/
├── middlewares/
├── models/
├── routes/
├── utils/
│
├── app.js
├── index.js
└── constants.js
```

---

## 🔐 Authentication Flow

1. User registers and password is hashed using bcrypt.
2. On login, Access Token and Refresh Token are generated.
3. Refresh Token is stored securely.
4. Access Token is used to access protected routes.
5. Refresh endpoint rotates tokens.
6. Logout clears authentication tokens.

---

## 📡 API Base URL

```
/api/v1
```

---

## 🏥 Health Check

```
GET /api/v1/health
```

Returns server status and uptime information.

---

## ⚙️ Installation

```
git clone <repository-url>
cd user-authentication-api
npm install
```

Create a `.env` file in the root directory:

```
PORT=
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=
```

Start the development server:

```
npm run dev
```

---

## 🎯 Learning Focus

- JWT Authentication Architecture
- Secure Password Storage
- Refresh Token Handling
- Middleware-Based Authorization
- File Upload Handling with Multer
- Cloud Storage Integration
- Scalable Backend Structure

---

## 🔮 Future Improvements

- Role-Based Access Control
- Email Verification
- OTP-Based Password Reset
- OAuth Integration
- Rate Limiting
- Account Lockout Mechanism

---

## 👨‍💻 Author

Saurav Kaushik
