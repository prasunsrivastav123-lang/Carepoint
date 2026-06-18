# CarePoint 🏥

CarePoint is an AI-powered hospital appointment booking and crowd management platform designed to reduce patient waiting times, optimize OPD scheduling, and improve healthcare accessibility.

## 🚀 Features

### 👨‍⚕️ Patient Features

* Patient Registration & Login
* OTP Email Authentication
* Book Appointments Online
* View Upcoming Appointments
* Appointment Reminders
* Doctor Search & Filtering
* Real-time Appointment Status

### 🩺 Doctor Features

* Doctor Profile Management
* Appointment Scheduling
* Patient Records Access
* Availability Management

### 🏥 Hospital Features

* OPD Crowd Management
* Appointment Optimization
* Patient Queue Monitoring
* Analytics Dashboard

### 🤖 AI Features (Upcoming)

* OPD Rush Prediction
* Estimated Waiting Time
* Smart Appointment Allocation
* Nearby Hospital Recommendations

---

# 📂 Project Structure

```text
carepoint/
├── carepoint-backend/
│   ├── server.js
│   ├── .env.example
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   └── whatsapp.js
│   └── cron/
│       └── reminders.js
│
└── carepoint-frontend/
    └── src/
        ├── lib/
        │   └── api.ts
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useAppointments.ts
        └── .env.example
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* TanStack Start
* TanStack Router
* Tailwind CSS
* Axios
* React Query

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Nodemailer
* Node Cron

## Deployment

* Frontend: Vercel
* Backend: Render / Railway
* Database: MongoDB Atlas

---

# ⚙️ Environment Variables

## Backend (`carepoint-backend/.env`)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
```

## Frontend (`carepoint-frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/carepoint.git
cd carepoint
```

---

## Backend Setup

```bash
cd carepoint-backend

npm install

cp .env.example .env

npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd carepoint-frontend

npm install

cp .env.example .env.local

npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

# 🔐 Authentication Flow

1. User registers with email.
2. OTP is sent to registered email.
3. User verifies OTP.
4. JWT token is generated.
5. Protected routes use JWT middleware.

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
GET  /api/auth/me
```

## Doctors

```http
GET    /api/doctors
GET    /api/doctors/:id
POST   /api/doctors
PUT    /api/doctors/:id
DELETE /api/doctors/:id
```

## Patients

```http
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

## Appointments

```http
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

---

# 🔔 Reminder System

Automatic reminders are sent using:

* Node Cron
* Email Notifications
* WhatsApp Integration (Optional)

Location:

```text
cron/reminders.js
```

---

# 🌟 Future Roadmap

* AI OPD Rush Prediction
* Hospital Capacity Monitoring
* Real-time Queue Tracking
* Nearby Hospital Suggestions
* Emergency Appointment System
* Doctor Rating & Reviews
* Mobile Application

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Prasun Srivastav**

* NIT Durgapur
* Full Stack Developer
* Open Source Contributor

If you like this project, consider giving it a ⭐ on GitHub.
