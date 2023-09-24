const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');

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
app.use('/api/v1/booker', bookerRoutes);
app.use('/api/v1/teamlead', teamleadRoutes);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TRAUXIT-API',
      version: '1.0',
      description: 'Trauxit Freight application api.',
      license: {
        name: '© 2022 TRAUXIT LLC',
      },
      contact: {
        name: 'Trauxit',
        phone: '+1 317-702-6298',
        email: 'support@trauxit.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/',
      },
    ],
  },
  // Define the paths to your API route files in the 'apis' property.
  apis: ['./routes/*.js', './models/*.js'],
  // Replace with the actual path to your API route files.
};

const swaggerSpec = swaggerjsdoc(options);
app.use('/', swaggerui.serve, swaggerui.setup(swaggerSpec));

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});
app.use(errorController);

module.exports = app;
