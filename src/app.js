const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const { getContractByIdForProfile } = require('./endpoints/getContractByIdForProfile');
const { getContractsForProfile } = require('./endpoints/getContractsForProfile');
const { getUnpaidJobs } = require('./endpoints/getUnpaidJobs');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, getContractByIdForProfile)

app.get('/contracts', getProfile, getContractsForProfile)

app.get('/jobs/unpaid', getProfile, getUnpaidJobs);

module.exports = app;
