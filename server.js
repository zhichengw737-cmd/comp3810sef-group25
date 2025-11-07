const mongoose = require('mongoose');
const express = require('express');
const cookieSession = require('cookie-session');
const engine = require('ejs-mate');
const path = require('path');

const app = express();

// MongoDB connection
const uri = 'mongodb+srv://1234567:Aaa20050613@cluster0.eyzqzgd.mongodb.net/cloud_attendance?retryWrites=true&w=majority';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('connected', () => console.log('Connected to MongoDB Atlas'));
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.on('disconnected', () => console.log('Disconnected from MongoDB Atlas'));

// View engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: ['yourSecretKey']
}));

app.use((req, res, next) => {
  res.locals.sessionUser = req.session ? req.session.user : null;
  next();
});

// Models
const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  password: String,
  role: String
});
const User = mongoose.model('User', userSchema);

const attendanceSchema = new mongoose.Schema({
  userId: String,
  name: String,
  timestamp: Date,
  location: {
    latitude: Number,
    longitude: Number
  }
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

const attendanceWindowSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  createdBy: String
});
const AttendanceWindow = mongoose.model('AttendanceWindow', attendanceWindowSchema);

// Auth middleware
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  req.session = null;
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId, password });
    if (user) {
      req.session.user = {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        role: user.role
      };
      res.redirect('/attendance');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/attendance', requireLogin, async (req, res) => {
  try {
    const now = new Date();
    const window = await AttendanceWindow.findOne({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    const existing = window
      ? await Attendance.findOne({
          userId: req.session.user.userId,
          timestamp: { $gte: window.startTime, $lte: window.endTime }
        })
      : null;

    res.render('attendance', {
      title: 'Take Attendance',
      window,
      existing
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/attendance', requireLogin, async (req, res) => {
  try {
    const now = new Date();
    const window = await AttendanceWindow.findOne({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    if (!window) {
      return res.json({ status: 'no-window' });
    }

    const existing = await Attendance.findOne({
      userId: req.session.user.userId,
      timestamp: { $gte: window.startTime, $lte: window.endTime }
    });

    if (existing) {
      return res.json({ status: 'already', time: existing.timestamp, location: existing.location });
    }

    const { latitude, longitude } = req.body;
    const record = await Attendance.create({
      userId: req.session.user.userId,
      name: req.session.user.name,
      timestamp: now,
      location: { latitude, longitude }
    });

    res.json({ status: 'success', time: record.timestamp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

app.get('/api/attendance', requireLogin, async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.session.user.userId });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/release', requireLogin, (req, res) => {
  if (req.session.user.role !== 'teacher') {
    return res.status(403).send('Only teachers can release attendance');
  }
  res.render('release', { title: 'Release Attendance' });
});

app.post('/release', requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== 'teacher') {
      return res.status(403).send('Only teachers can release attendance');
    }

    const duration = parseInt(req.body.duration);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);

    await AttendanceWindow.create({
      startTime,
      endTime,
      createdBy: req.session.user.userId
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const user = req.session.user;
    let records = [];
    let users = [];

    if (user.role === 'teacher') {
      records = await Attendance.find();
      users = await User.find();
    } else {
      records = await Attendance.find({ userId: user.userId });
      const self = await User.findById(user._id);
      if (self) users = [self];
    }

    res.render('dashboard', {
      title: 'Dashboard',
      user,
      records,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/create', requireLogin, (req, res) => {
  if (req.session.user.role !== 'teacher') {
    return res.status(403).send('Only teachers can create users');
  }
  res.render('create', { title: 'Create User' });
});

app.post('/create', requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== 'teacher') {
      return res.status(403).send('Only teachers can create users');
    }

    const { userId, name, password, role } = req.body;
    await User.create({ userId, name, password, role });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/edit/:id', requireLogin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = req.session.user;

    if (!targetUser) return res.status(404).send('User not found');

    if (currentUser.role !== 'teacher' && currentUser._id !== targetUser._id.toString()) {
      return res.status(403).send('Permission denied');
    }

    res.render('edit', { title: 'Edit User', user: targetUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/update/:id', requireLogin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = req.session.user;

    if (!targetUser) return res.status(404).send('User not found');

    if (currentUser.role !== 'teacher' && currentUser._id !== targetUser._id.toString()) {
      return res.status(403).send('Permission denied');
    }

    const { userId, name, password, role } = req.body;
    const updateData = { userId, name, password };
    if (currentUser.role === 'teacher') updateData.role = role;

    await User.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/delete/:id', requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== 'teacher') {
      return res.status(403).send('Only teachers can delete users');
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.render('logout', { title: 'Logged Out' });
});

app.get('/window', requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== 'teacher') {
      return res.status(403).send('Only teachers can manage attendance windows');
    }

    const now = new Date();
    const window = await AttendanceWindow.findOne({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    const allStudents = await User.find({ role: 'student' });
    const signedIn = await Attendance.find({
      timestamp: { $gte: window?.startTime, $lte: window?.endTime }
    });

    res.render('window', {
      title: 'Manage Attendance Window',
      window,
      allStudents,
      signedIn
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/window/end', requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== 'teacher') {
      return res.status(403).send('Only teachers can end attendance windows');
    }

    const now = new Date();
    await AttendanceWindow.updateMany(
      { endTime: { $gte: now } },
      { $set: { endTime: now } }
    );

    res.redirect('/window');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

