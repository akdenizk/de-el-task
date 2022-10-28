const { Op } = require('sequelize');

const getUnpaidJobs = async (req, res, next) => {
  const { Contract, Job } = req.app.get('models')
  const profile = req.profile;
  const query = profile.type === 'client' ? { ClientId: profile.id } : { ContractorId: profile.id };
  const contract = await Contract.findAll({ where: query });

  const contractIdList = contract.map(contract => contract.id);
  const notPaidCondition = { [Op.or]: { [Op.is]: null, [Op.not]: true } };
  const unpaidJobs = await Job.findAll({ where: { ContractId: { [Op.or]: contractIdList }, paid: notPaidCondition } })

  if (!unpaidJobs) return res.status(404).end()
  res.json(unpaidJobs)
}

module.exports = { getUnpaidJobs };