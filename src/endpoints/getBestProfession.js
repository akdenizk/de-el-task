const { Op, json } = require("sequelize");

const getBestProfession = async (req, res, next) => {
  const { Job, Contract, Profile } = req.app.get('models');

  const { start, end } = req.query;

  let startDate, endDate;

  if (start) startDate = new Date(start);
  else startDate = new Date(0);

  if (end) endDate = new Date(end);
  else endDate = new Date((new Date()).getTime() * 2); //shortcut to make a really far ahead date to include all the possible records in query;

  const paidJobsWithinDates = await Job.findAll({ where: { paymentDate: { [Op.or]: { [Op.gt]: startDate, [Op.lt]: endDate } }, paid: true } });

  const contractIdList = paidJobsWithinDates.map(job => job.ContractId);

  // const jobsByContractId = Object.assign({}, ...paidJobsWithinDates.map(job => ({ [job.ContractId]: job })));

  const contracts = await Contract.findAll({ where: { id: contractIdList } });

  // const contractsByContractorId = Object.assign({}, ...contracts.map(contract => ({ [contract.ContractorId]: contract })));
  const contractsByContractId = Object.assign({}, ...contracts.map(contract => ({ [contract.id]: contract })));

  const contractorIdList = contracts.map(contract => contract.ContractorId);

  const contractors = await Profile.findAll({ where: { id: contractorIdList } });

  const contractorsById = Object.assign({}, ...contractors.map(contractor => ({ [contractor.id]: contractor })));

  const earnedAmountByProfession = Object.assign({}, ...contractors.map(contractor => ({ [contractor.profession]: 0.0 })));

  paidJobsWithinDates.forEach(job => {
    const contract = contractsByContractId[job.ContractId];
    const contractor = contractorsById[contract.ContractorId];
    earnedAmountByProfession[contractor.profession] += job.price;
  })

  const professionPriceList = [];

  for (const [profession, amount] of Object.entries(earnedAmountByProfession))
    professionPriceList.push({ profession, amount });

  const mostEarningProfessions = professionPriceList.sort((first, second) => second.amount - first.amount);

  const mostEarning = mostEarningProfessions[0];

  res.status(200).send(`Most earning profession within the queried dates is "${mostEarning.profession}" with the earned amount ${mostEarning.amount}`)
}

module.exports = { getBestProfession };