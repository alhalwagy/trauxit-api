const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const loadsRoutes = require('./routes/loadsRouter');
const shipperRoutes = require('./routes/shipperRouter');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(express.json({}));
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

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(errorController);

module.exports = app;
