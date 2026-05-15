import Joi from 'joi';

export const leaveApplySchema = Joi.object({
  employee: Joi.string().required(),
  type: Joi.string().valid('Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().allow(''),
});

export const leaveApprovalSchema = Joi.object({
  decision: Joi.string().valid('Approved', 'Rejected').required(),
});
