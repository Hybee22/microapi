const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Global Middlewares
// Set Security HTTP Headers
app.use(helmet());

app.use(cors());
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit Request from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body Parser -> Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie Parser
app.use(cookieParser());

// Data sanitize against NoSQL Query Injection
app.use(mongoSanitize()); // Checks the request headers, query strings, params for malicious codes

// Data sanitize against XSS
app.use(xss()); // Cleans user input from malicious HTML codes

// ROUTES
const authRouter = require('./routes/authRoutes');

//   Routes Middleware
app.use('/api/v1/auth', authRouter);

// Unhandles Routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find resource ${req.originalUrl} on this server`, 404)
  );
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
