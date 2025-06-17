const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require("path");


const DBconnection = require("./config/DB");
const Admin = require('./models/admin');
const Appointment = require('./models/appointments');

const PORT = process.env.PORT || 3000; 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));



DBconnection();

function verifyToken(req, res, next) {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.redirect("/admin/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}


app.get("/" , (req , res) => {

    res.render("landingPage")
})


app.get("/adminSign" , async(req,res) =>{

    res.render('admin/adminSignup')

})


app.post('/adminSign', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log(name)
  

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10); 
  

      const newUser = new Admin({ username: name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'Admin created successfully', user: { name: newUser.name, email: newUser.email } });
    } catch (err) {
      console.error("Error saving admin:", err);
      res.status(500).json({ message: 'Error creating admin', error: err.message });
    }

  });
  
  app.get('/admin/login', (req, res) => {
    res.render('admin/adminLogin');
  });




  app.post('/adminLogin', async (req, res) => {
    const { email, password } = req.body;
  
    try {

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).send('❌ Invalid email or password');
      }
  

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).send('❌ Invalid email or password');
      }
  

      const token = jwt.sign(
        { id: admin._id, email: admin.email, username: admin.name },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, 
      });
  

      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).send('❌ Server error');
    }
  });



app.get('/admin/dashboard', verifyToken, (req, res) => {
  res.render('admin/dashboard', {
    admin: {
      id: req.admin.id,
      name: req.admin.name || 'Admin',
      email: req.admin.email
    }
  });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
  });


  app.get('/admin/appointments', verifyToken, (req, res) => {
    res.render('admin/appointments')
  });
  
  app.get('/admin/leave', verifyToken, (req, res) => {
    res.send('Tour Programme / Leave page coming soon...');
  });
  

app.post('/admin/appointments', async (req, res) => {
    try {
      const { date, time, withh , designation, purpose, venue, isVIP } = req.body;

  
      const newAppointment = new Appointment({
        date: new Date(date),
        time,
        withh,
        designation,
        purpose,
        venue,
        isVIP: isVIP === 'on' ? true : false 
      });
  
      await newAppointment.save();
  
     
      res.send('Appointment/Meeting saved successfully!');
     
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error while saving appointment.');
    }
  });

  app.get('/appointments/all', async (req, res) => {
    try {
      const appointments = await Appointment.find().sort({ date: 1, time: 1 });
      res.render('admin/appointments-list', { appointments });
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
  

  app.get('/admin/appointments/view', async (req, res) => {
    try {
    const { from, to } = req.query;
    let filter = {};
    

    if (from && to) {
      
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    } else if (from) {
      filter.date = { $gte: new Date(from) };
    } else if (to) {
      filter.date = { $lte: new Date(to) };
    }
    
    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    
    res.render('admin/appointments-list', { appointments });
    } catch (err) {
    console.error('Error fetching filtered appointments:', err);
    res.status(500).send('Server Error');
    }
    });
  
    app.get('/admin/appointments/edit/:id', async (req, res) => {
        try {
          const appointment = await Appointment.findById(req.params.id);
          if (!appointment) return res.status(404).send('Appointment not found');
          res.render('admin/editAppointment', { appointment });
        } catch (err) {
          console.error('Error fetching appointment:', err);
          res.status(500).send('Server Error');
        }
      });
      

      app.post('/admin/appointments/edit/:id', async (req, res) => {
        try {
          const { date, time, withh, designation, purpose, venue, isVIP } = req.body;
          await Appointment.findByIdAndUpdate(req.params.id, {
            date,
            time,
            withh,
            designation,
            purpose,
            venue,
            isVIP: isVIP === 'on'
          });
          res.redirect('/admin/appointments/view');
        } catch (err) {
          console.error('Error updating appointment:', err);
          res.status(500).send('Server Error');
        }
      });

      app.get('/employee', (req, res) => {
        res.render('customer/landing');
      });
      

      app.get('/employee/appointments/view', async (req, res) => {
        try {
          const { from, to } = req.query;
          let query = {};
      
          if (from && to) {
            query.date = { $gte: from, $lte: to };
          }
      
          const appointments = await Appointment.find(query).sort({ date: 1 });
          res.render('customer/cusAppointmentsList', { appointments });
        } catch (err) {
          console.error('Error fetching appointments:', err);
          res.status(500).send('Server Error');
        }
      });
      
      
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
