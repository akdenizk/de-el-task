const { Op } = require("sequelize");

const getBestClients = async (req, res, next) => {
  const { Job, Contract, Profile } = req.app.get('models');

  const { start, end, limit } = req.query;

  let startDate, endDate;

  if (start) startDate = new Date(start);
  else startDate = new Date(0);

  if (end) endDate = new Date(end);
  else endDate = new Date((new Date()).getTime() * 2); //shortcut to make a really far ahead date to include all the possible records in query;

  const paidJobsWithinDates = await Job.findAll({ where: { paymentDate: { [Op.or]: { [Op.gt]: startDate, [Op.lt]: endDate } }, paid: true } });

  const contractIdList = paidJobsWithinDates.map(job => job.ContractId);

  const contracts = await Contract.findAll({ where: { id: contractIdList } });

  const contractsByContractId = Object.assign({}, ...contracts.map(contract => ({ [contract.id]: contract })));

  const clientIdList = contracts.map(contract => contract.ClientId);

  const clients = await Profile.findAll({ where: { id: clientIdList } });

  const clientsById = Object.assign({}, ...clients.map(client => ({ [client.id]: client })));

  const paymentsByClients = Object.assign({}, ...clients.map(client => ({ [client.id]: 0.0 })));

  paidJobsWithinDates.forEach(job => {
    const contract = contractsByContractId[job.ContractId];
    const client = clientsById[contract.ClientId];
    paymentsByClients[client.id] += job.price;
  })

  const clientPaymentList = [];

  for (const [clientId, amount] of Object.entries(paymentsByClients))
    clientPaymentList.push({ clientId, amount });

  const mostPaidClients = clientPaymentList.sort((first, second) => second.amount - first.amount).map(info => {
    return { id: info.clientId, paid: info.amount, fullName: `${clientsById[info.clientId].firstName} ${clientsById[info.clientId].lastName}` };
  });

  const limitNumber = limit <= 0 ? 1 : limit;

  const mostPaidClientsLimited = mostPaidClients.slice(0, limitNumber);

  res.json(mostPaidClientsLimited)
}

module.exports = { getBestClients };