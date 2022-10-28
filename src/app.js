const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile');
const { getContractByIdForProfile } = require('./endpoints/getContractByIdForProfile');
const { getContractsForProfile } = require('./endpoints/getContractsForProfile');
const { getUnpaidJobs } = require('./endpoints/getUnpaidJobs');
const { payForJob } = require('./endpoints/payForJob');
const { depositMoney } = require('./endpoints/depositMoney');
const { getBestProfession } = require('./endpoints/getBestProfession');

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

app.post('/jobs/:job_id/pay', getProfile, payForJob);

//I think there is no need for userId, a profile can only deposit to his/her own balance. there is only one balance per a profile at the moment.
// if there were multiple balances, a balance id could be used as a path parameter such as /balances/deposit/:balanceId or account id such as /balances/deposit/:accountId
// but I'll leave it as it is since it is requested this way and someone else might have thought something for the future or could be aware of some other requirements that are not written here.
app.post('/balances/deposit/:userId', getProfile, depositMoney)

app.get('/admin/best-profession', getBestProfession);

module.exports = app;
