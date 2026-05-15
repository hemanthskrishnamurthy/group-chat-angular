export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(422).json({ message: 'Validation failed', details: error.details.map((item) => item.message) });
    }
    req.body = value;
    return next();
  };
}
