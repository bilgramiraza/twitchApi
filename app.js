const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('./configs/mongoose-config');
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");

const apiRouter = require('./routes/api');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'"],
    },
  }),
);

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
app.use(limiter);

const originLinks = process.env.ORIGIN_LINKS? process.env.ORIGIN_LINKS.split(','):[]; 
const corsOptions = {
  origin:originLinks,
  optionsSuccessStatus: 200,
};
app.options('*', cors(corsOptions));

app.use('/api', cors(corsOptions), apiRouter);

module.exports = app;
