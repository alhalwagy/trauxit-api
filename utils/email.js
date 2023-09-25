const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, randomNum) {
    this.to = user.email;
    this.firstName = user.fullName.split(' ')[0];
    this.randomNum = randomNum;
    this.from = `Ahmed Alhalwagy <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: '4X{A+Ilr#CiU',
      },
    });
  }
  //Send the actual email
  async send(template, subject) {
    //1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      randomNum: this.randomNum,
      subject,
    });
    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };
    //3) create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Trauxit Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'resetPassMail',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
