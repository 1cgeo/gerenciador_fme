'use strict'

const Joi = require('joi')

const models = {}

models.login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  cliente: Joi.string().required().valid('fme_web')
})

module.exports = models