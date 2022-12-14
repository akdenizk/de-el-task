const { sequelize } = require("../model");

const payForJob = async (req, res, next) => {
  const { Job, Profile, Contract } = req.app.get('models')
  const profile = req.profile;

  const { job_id: id } = req.params;
  const job = await Job.findOne({ where: { id } });
  if (!job) return res.status(404).send("Job not found");

  const contract = await Contract.findOne({ where: { id: job.ContractId } });

  const contractor = await Profile.findOne({ where: { id: contract.ContractorId } });

  if (profile.id !== contract.ClientId) return res.status(401).send('You are not authorized to pay for this job');

  if (job.paid) return res.status(404).send("Payment for this job has already been made.");

  const canPay = profile.type === 'client';
  if (!canPay) return res.status(400).send.end('Contractor cannot pay for the job');

  if (profile.balance < job.price) return res.status(400).send('Not enough balance to pay for the job. Please transfer funds to your balance to proceed with payment.');

  try {
    await sequelize.transaction(async (t) => {
      await Profile.update({
        balance: profile.balance - job.price
      }, { where: { id: profile.id }, transaction: t, returning: true });

      await Job.update({ paid: true, paymentDate: new Date().toISOString() }, { where: { id }, transaction: t, returning: true })

      await Profile.update({ balance: contractor.blaance + job.price }, { where: { id: contractor.id }, transaction: t, returning: true });
    });

    return res.status(200).send(`Payment has been successfully made for job`);
  }
  catch (error) {
    console.debug("error", error);
    return res.status(500).send("an unexpected error happened, please try again later.");
  }
}

module.exports = { payForJob };