```markdown
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
- Login and logout 
- Create, view, update, and delete attendance records 
- RESTful API for attendance data 
- Responsive UI with popup feedback 
- Cloud-hosted and publicly accessible

API Endpoints: 
GET `/api/attendance` — Get all attendance records (supports optional query by userId, start, end) 
POST `/api/attendance` — Create a new attendance record 
PUT `/api/attendance/:id` — Update a record by ID (supports name, timestamp, location) 
DELETE `/api/attendance/:id` — Delete a record by ID

Sample curl commands:

```
curl https://comp3810sef-group25.onrender.com/api/attendance
```

```
curl -X POST https://comp3810sef-group25.onrender.com/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","name":"Test User","latitude":22.3,"longitude":114.2}'
```

```
curl -X PUT https://comp3810sef-group25.onrender.com/api/attendance/690d90cc94a02a28cba509ad \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","latitude":22.4}'
```

```
curl -X DELETE https://comp3810sef-group25.onrender.com/api/attendance/690d90e194a02a28cba509af
```

Notes: 
- The system is fully deployed and accessible online. 
- All API endpoints support full CRUD operations. 
- MongoDB Atlas is used for persistent cloud storage. 
- The UI is optimized for responsiveness and usability.
```
