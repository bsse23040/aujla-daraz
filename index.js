const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Twilio } = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Twilio credentials
const accountSid = 'W37L927YJVFTW2NPKBLXJ8GK';
const authToken = 'f7e8256ef0aac207e60bce9c73439d0d';
const twilioNumber = '+15012468303';
const myWhatsappNumber = '+923344320120';

const client = new Twilio(accountSid, authToken);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle sending WhatsApp message
app.post('/send-message', (req, res) => {
  const { message } = req.body;
  const encodedMessage = encodeURIComponent(message);

  // Construct the WhatsApp link with pre-filled message
  const whatsappLink = `https://wa.me/${myWhatsappNumber}?text=${encodedMessage}`;

  // Respond with the WhatsApp link
  res.json({ url: whatsappLink });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
