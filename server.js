const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const FormSubmission = require('./models/FormSubmission');
const Subscriber = require('./models/Subscriber');

const app = express();

app.use(cors());
app.use(express.json()); 



const path = require('path');

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.post('/api/form', async (req, res) => {
  try {
    const { fullName, email, phone, service, subject, message } = req.body;

    // Check if email already exists
    const existingEmail = await FormSubmission.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }

    // Check if phone already exists
    const existingPhone = await FormSubmission.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already exists. Please use a different phone number.' });
    }

    // Create new form document
    const newForm = new FormSubmission({
      fullName,
      email,
      phone,
      service,
      subject,
      message
    });

    await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Server Error' });
  }
});



// POST route for newsletter subscription


app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Successfully subscribed!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
