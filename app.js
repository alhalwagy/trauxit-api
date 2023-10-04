const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');
const path = require('path');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const loadsRoutes = require('./routes/loadsRouter');
const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');
const reviewRoutes = require('./routes/reviewRouter');
const carRoutes = require('./routes/carRouter');
const carrierRoutes = require('./routes/carrierRouter');
const shipperRoutes = require('./routes/shipperRouter');
const ticketRoutes = require('./routes/ticketRouter');
const bookerRoutes = require('./routes/bookerRouter');
const teamleadRoutes = require('./routes/teamleadRouter');

const app = express();

app.use(express.json({}));
app.use(cors());
//Implement CORS
// app.use(cors());

// app.options("*", cors());

//serving static file
app.use('/public/img/', express.static(path.join(__dirname, 'public/img/')));

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());

// app.use('/loads', loadsRoutes);
app.use('/api/v1/shipper', shipperRoutes);
app.use('/api/v1/carrier', carrierRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/loads', loadsRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/car', carRoutes);
app.use('/api/v1/ticket', ticketRoutes);
app.use('/api/v1/booker', bookerRoutes);
app.use('/api/v1/teamlead', teamleadRoutes);

app.get('/favicon.ico', (req, res) => {
  // Send a 204 No Content response to indicate that there's no favicon.
  res.status(204).end();
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});
app.use(errorController);

module.exports = app;
