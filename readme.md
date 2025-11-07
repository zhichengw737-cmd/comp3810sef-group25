# Cloud Attendance System

Group 25 
Members: 
- WANG Zhicheng — 13335476 
- FU Zihang — 13374938 
- NG KWAN YIU — 13491854 
- Cheung Ka Yiu — 13486371 
- Wang Chu Ce — 13377547

This project is a cloud-based attendance system designed for teachers to manage student check-ins. It allows users to log in, view and edit attendance records, and interact with a RESTful API. The system is deployed on Render and uses MongoDB Atlas for data storage.

Live demo: https://comp3810sef-group25.onrender.com/

Technologies used: 
- Node.js with Express 
- MongoDB Atlas (via Mongoose) 
- EJS templating 
- Hosted on Render

Features: 
- Teacher login and logout 
- Create, view, update, and delete attendance records 
- RESTful API for attendance data 
- Responsive UI with popup feedback 
- Cloud-hosted and publicly accessible

API Endpoints: 
GET `/api/attendance` — Get all attendance records 
POST `/api/attendance` — Create a new attendance record 
PUT `/api/attendance/:id` — Update a record by ID 
DELETE `/api/attendance/:id` — Delete a record by ID

Sample curl commands:

```
curl https://comp3810sef-group25.onrender.com/api/attendance
```

```
curl -X POST https://comp3810sef-group25.onrender.com/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"studentId":"13335476","status":"Present","date":"2025-11-07"}'
```

```
curl -X PUT https://comp3810sef-group25.onrender.com/api/attendance/<record_id> \
  -H "Content-Type: application/json" \
  -d '{"status":"Absent"}'
```

```
curl -X DELETE https://comp3810sef-group25.onrender.com/api/attendance/<record_id>
```

Notes: 
- The system is fully deployed and accessible online. 
- All API endpoints support full CRUD operations. 
- MongoDB Atlas is used for persistent cloud storage. 
- The UI is optimized for responsiveness and usability.
