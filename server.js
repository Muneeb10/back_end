const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173/', // ✅ Replace this with your actual frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Multer Setup (for handling multipart/form-data)
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.post('/api/form', upload.fields([
  { name: 'cnicFront' },
  { name: 'cnicBack' },
  { name: 'applicantPhoto' },
  { name: 'screenshot' }
]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      jobTitle,
      email,
      whatsapp,
      cnic,
      address,
      loanAmount
    } = req.body;

    const files = req.files;

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your SMTP service
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email address
        pass: process.env.EMAIL_PASSWORD  // Your email app password
      }
    });

    const mailOptions = {
      from: email, // use user's email as sender
      to: process.env.RECEIVER_EMAIL, // stored in .env
      subject: `New Loan Application from ${firstName} ${lastName}`,
      text: `
New Loan Application Received:

Name: ${firstName} ${lastName}
Job Title: ${jobTitle}
Email: ${email}
WhatsApp: ${whatsapp}
CNIC: ${cnic}
Address: ${address}
Loan Amount: ${loanAmount}
      `,
      attachments: [
        {
          filename: files.cnicFront?.[0]?.originalname,
          content: files.cnicFront?.[0]?.buffer
        },
        {
          filename: files.cnicBack?.[0]?.originalname,
          content: files.cnicBack?.[0]?.buffer
        },
        {
          filename: files.applicantPhoto?.[0]?.originalname,
          content: files.applicantPhoto?.[0]?.buffer
        },
        {
          filename: files.screenshot?.[0]?.originalname,
          content: files.screenshot?.[0]?.buffer
        }
      ].filter(Boolean)
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted and emailed successfully' });

  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
