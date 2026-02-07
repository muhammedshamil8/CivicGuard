const express = require('express');
const app = express();
require("dotenv").config()
var cors = require('cors')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

app.use(cors())

app.use(bodyParser.json());
const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
console.log("SID:", process.env.TWILIO_ACC_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);


const transporter = nodemailer.createTransport({
  service: 'gmail', // Use any SMTP provider
  auth: {
    user: 'iedcemeadeveloper@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

app.get('/', (req, res) => {
  res.send("Hello World")
});

app.post('/alert', (req, res) => {
  client.calls.create({
    url: "https://demo.twilio.com/welcome/voice/",
    to: "+918089465673",
    from: "+14243736458",
  })
    .then(call => console.log(call.sid));
});

app.post('/send-email', async (req, res) => {
  const { title, content } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECIPIENT,
    subject: `Emergency Report: ${title}`,
    text: `${content}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Report sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send report' });
  }
});

const port = process.env.PORT || 2000;

app.listen(port, () => {

  console.log(`Server listening on port ${port}`);

});
