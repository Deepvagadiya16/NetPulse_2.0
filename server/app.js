const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('./config/env');
const { getDatabaseMode } = require('./utils/dbState');

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: getDatabaseMode(),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/technician', require('./routes/employeeRoutes'));
app.use('/api/admin', require('./routes/billingRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
