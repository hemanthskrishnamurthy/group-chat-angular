import Joi from 'joi';

export const employeeSchema = Joi.object({
  employeeId: Joi.string().required(),
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(''),
  department: Joi.string().required(),
  designation: Joi.string().required(),
  joiningDate: Joi.date().required(),
  salary: Joi.number().min(0).required(),
  address: Joi.string().allow(''),
  emergencyContact: Joi.string().allow(''),
  status: Joi.string().valid('Onboarding', 'Active', 'On Leave', 'Inactive').default('Onboarding'),
});
