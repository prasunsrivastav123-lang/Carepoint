carepoint/
├── carepoint-backend/        ← Node.js + Express + MongoDB (new)
│   ├── server.js
│   ├── .env.example          ← copy to .env and fill in
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
└── carepoint-frontend/       ← your existing TanStack Start project
    └── src/
        ├── lib/
        │   └── api.ts        ← axios instance (copy into your src/lib/)
        ├── hooks/
        │   ├── useAuth.ts    ← login/logout/me hooks
        │   └── useAppointments.ts  ← all query hooks
        └── .env.example      ← copy to .env.local
