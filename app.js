const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const loadsRoutes = require('./routes/loadsRouter');
const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');
const reviewRoutes = require('./routes/reviewRouter');
const carRoutes = require('./routes/carRouter');
const carrierRoutes = require('./routes/carrierRouter');
const shipperRoutes = require('./routes/shipperRouter');
const ticketRoutes = require('./routes/ticketRouter');
const companyRoutes = require('./routes/companyRouter');
const teamleadRoutes = require('./routes/teamleadRouter');

const app = express();

app.use(express.json({}));
app.use(cors());
//Implement CORS
// app.use(cors());

// app.options("*", cors());

//serving static file
// app.use(express.static(path.join(__dirname, "public")));

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
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/teamlead', teamleadRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(errorController);

module.exports = app;
