const mysql = require('mysql')
const params = require('../config/key')
const moment = require('moment')

const connection = mysql.createConnection({
  host: params.MYSQL_HOST,
  user: params.MYSQL_USER,
  password: params.MYSQL_PWD,
  database: params.MYSQL_DB,
  charset: 'utf8mb4'
})
connection.connect()

exports.sendQuery = (query, queryData, from) => {
  console.log(`------${moment().format('YY-DD-MM HH:mm:ss')}\n`+from + ': ', query, queryData + '\n')
  return new Promise((res, rej) => {
    connection.query(query, queryData, (error, result, fields) => {
      if (error) return rej(error)
      return res(result)
    })
  })
}