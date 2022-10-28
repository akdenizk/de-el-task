const { Op } = require('sequelize');

const getContractsForProfile = async (req, res) => {
  const { Contract } = req.app.get('models')
  const profile = req.profile;
  const query = profile.type === 'client' ? { ClientId: profile.id } : { ContractorId: profile.id };
  const contract = await Contract.findAll({ where: { ...query, status: { [Op.ne]: 'terminated' } } })
  if (!contract) return res.status(404).end()
  res.json(contract)
};

module.exports = { getContractsForProfile };