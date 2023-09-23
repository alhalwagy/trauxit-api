/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: '4X{A+Ilr#CiU',
    },
  });
  // const html = pug.renderFile(`${__dirname}/../views/welcome.pug`, {
  //   fullName: this.fullName,
  //   url: this.url,
  //   subject: 'Welcome to Join Us.',
  // });
  const mailOptions = {
    from: `TRAUXIT <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: options.message,

    // html,
    // text: htmlToText.htmlToText(html),
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
