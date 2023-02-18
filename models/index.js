'use strict'

const Sequelize = require('sequelize')
const config = require('../config/config.json')[process.env.NODE_ENV]
let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)
const db = {}

db.sequelize = sequelize
db.Sequelize = Sequelize

db.USER_INFO = require('./sequelize').USER_INFO(sequelize, Sequelize)
db.REQUEST = require('./sequelize').REQUEST(sequelize, Sequelize)

db.REQUEST.belongsTo(db.USER_INFO, { foreignKey: 'RECEIVERID', targetKey: 'ID' })

module.exports = db