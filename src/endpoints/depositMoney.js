const { sequelize } = require("../model");

/* 
  request sample for http post payload
  This model is missing in the Readme.md,
  so I took the liberty to define it as I see fit.
const depositMoneyRequest = {
  amount: 1250.0
}
*/

const depositMoney = async (req, res, next) => {
  const { Profile } = req.app.get('models');

  const { userId } = req.params;

  const { amount } = req.body;

  if (amount === 0) res.status(400).send('Please specify a positive amount to deposit');

  const { profile } = req;

  if (+userId !== +profile.id) return res.status(401).send('You can only deposit money to your own account'); //weird setup but ok. Check my comment on app.js endpoint declaration.

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