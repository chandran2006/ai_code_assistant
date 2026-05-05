const Joi = require('joi');

const LANGUAGES = ['javascript', 'python', 'java', 'typescript', 'c', 'cpp', 'go', 'rust'];

const debugSchema = Joi.object({
  code: Joi.string().min(5).max(10000).required().messages({
    'string.min': 'Code must be at least 5 characters.',
    'string.max': 'Code must not exceed 10,000 characters.',
    'any.required': 'Code is required.',
  }),
  language: Joi.string().valid(...LANGUAGES).required().messages({
    'any.only': `Language must be one of: ${LANGUAGES.join(', ')}.`,
    'any.required': 'Language is required.',
  }),
  explainLike5:  Joi.boolean().truthy('true').falsy('false').default(false),
  roastMode:     Joi.boolean().truthy('true').falsy('false').default(false),
  interviewMode: Joi.boolean().truthy('true').falsy('false').default(false),
});

const runSchema = Joi.object({
  code:     Joi.string().min(1).max(10000).required().messages({
    'string.min': 'Code is required.',
    'string.max': 'Code must not exceed 10,000 characters.',
    'any.required': 'Code is required.',
  }),
  language: Joi.string().valid(...LANGUAGES).required().messages({
    'any.only': `Language must be one of: ${LANGUAGES.join(', ')}.`,
    'any.required': 'Language is required.',
  }),
  stdin: Joi.string().max(4000).allow('').default('').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ''),
});

const makeValidator = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};

const validateDebugInput = makeValidator(debugSchema);
const validateRunInput   = makeValidator(runSchema);

module.exports = { validateDebugInput, validateRunInput };
