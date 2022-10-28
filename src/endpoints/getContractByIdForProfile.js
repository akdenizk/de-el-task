const getContractByIdForProfile = async (req, res) => {
  const { Contract } = req.app.get('models')
  const { id } = req.params
  const contract = await Contract.findOne({ where: { id } })
  const profile = req.profile;
  if (profile.id !== contract.ClientId && profile.id !== contract.ContractorId) return res.status(401).end();
  if (!contract) return res.status(404).end()
  res.json(contract)
};

module.exports = { getContractByIdForProfile };