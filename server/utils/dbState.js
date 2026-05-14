const mongoose = require('mongoose');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const getDatabaseMode = () => (isDatabaseConnected() ? 'connected' : 'mock');

module.exports = {
  isDatabaseConnected,
  getDatabaseMode,
};
