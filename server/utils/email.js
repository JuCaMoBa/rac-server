const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid');
const { textTemplate, htmlTemplate, sendTo } = require('./template');
const config = require('../../server/config/');

const { mail } = config;

exports.mail = async function run(data) {
  var options = {
    apiKey: mail.apiKey,
  };

  // 2. Crear el transport (Fake - Ethereal, Gmail, Sendgrid, MailGun, Postmark)
  let transporter = nodemailer.createTransport(sgTransport(options));

  // 3. Send Email
  let info = await transporter
    .sendMail({
      from: '"Juan Moreno" <juan.carlos.moreno.banda@hotmail.com>', // sender address
      to: data.email, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: textTemplate(data), // plain text body
      html: htmlTemplate(data), // html body
    })
    .then(() => console.log('Correo enviado'))
    .catch((e) => console.log(e));
};
