const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, randomNum) {
    console.log(user);
    this.to = user.email;
    if (user.userName) this.userName = user.userName;
    this.randomNum = randomNum;
    this.from = `Trauxit mail <${process.env.EMAIL_FROM}>`;
    if (user.teamName) this.teamName = user.teamName;
    this.url = randomNum;
  }
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,

      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: '&sd8av&WKG?k',
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
  }
  //Send the actual email
  async send(template, subject) {
    //1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      userName: this.userName,
      teamName: this.teamName,
      randomNum: this.randomNum,
      url: this.url,
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
    await this.send('welcomeMail', 'Welcome to the Trauxit Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'resetPassMail',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
  async sendTeamId() {
    await this.send(
      'teamIdMail',
      'Your Secure Team ID Do Not Share it.Make Your Team Secure.'
    );
  }
  async sendPasswordReset2() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

