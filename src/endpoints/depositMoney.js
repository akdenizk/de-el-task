const { sequelize } = require("../model");
const { Op } = require('sequelize');

/* 
  request sample for http post payload
  This model is missing in the Readme.md,
  so I took the liberty to define it as I see fit.
const depositMoneyRequest = {
  amount: 1250.0
}
*/

const depositMoney = async (req, res, next) => {
  const { Profile, Job, Contract } = req.app.get('models');

  const { userId } = req.params;

  const { amount } = req.body;

  if (amount === 0) res.status(400).send('Please specify a positive amount to deposit');

  const { profile } = req;

  if (+userId !== +profile.id) return res.status(401).send('You can only deposit money to your own account'); //weird setup but ok. Check my comment on app.js endpoint declaration.

  const query = profile.type === 'client' ? { ClientId: profile.id } : { ContractorId: profile.id };
  const contracts = await Contract.findAll({ where: query });

  const contractIdList = contracts.map(contract => contract.id);
  const notPaidCondition = { [Op.or]: { [Op.is]: null, [Op.not]: true } };
  const jobsPendingPayment = await Job.findAll({ where: { ContractId: { [Op.or]: contractIdList }, paid: notPaidCondition }, raw: true })

  const paymentsTotal = jobsPendingPayment.map(job => job.price).reduce((first, second) => first + second, 0);

  const maxDepositLimit = paymentsTotal * 0.25;

  if (amount > maxDepositLimit)
    return res.status(404).send(`You can only deposit up to 25 % of the total price of jobs that are pending payment. The specified amount (${amount}) is higher than ${maxDepositLimit} which is 25 % of ${paymentsTotal} (total amount of pending payments). Please specify an amount equal to or less than ${maxDepositLimit}`);

  try {
    await sequelize.transaction(async (t) => {
      await Profile.update({ balance: profile.balance + amount }, { where: { id: profile.id }, transaction: t })
    })

    res.status(200).send("You have successfully deposited money to your balance");
  }
  catch (error) {
    console.debug("error", error);
    return res.status(500).send("an unexpected error happened, please try again later.");
  }

}

module.exports = { depositMoney };