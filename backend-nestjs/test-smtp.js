const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'misacademyonline.com',
    port: 465,
    secure: true,
    auth: {
        user: 'soporte@misacademyonline.com',
        pass: 'i1X0gI%bpq7!;J&('
    }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
