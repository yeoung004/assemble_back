const { sendQuery } = require("../middleware/mysql")
const queryDispatcher = async (query, queryData) => {
  return await sendQuery(query, queryData, 'SYSTEM')
}

// -----------------------------INSERT-------------------------------------------
exports.insertReport = (queryData) => {
  let query = `
    INSERT INTO 
      REPORT(
        REPORTER,
        REASON,
        REFERENCEID,
        REPORTED_AT
      )VALUES(
        ?,
        ?,
        ?,
        NOW()
      )
  `
  let data = [
    queryData.REPORTER,
    queryData.REASON,
    queryData.REFERENCEID
  ]
  return queryDispatcher(query, data)
}

exports.insertBlock = (queryData) => {
  let query = `
    INSERT INTO 
      BLOCK(
        USERID,
        REFERENCEID,
        REASON,
        BLOCKED_AT
      )VALUES(
        ?,
        ?,
        ?,
        NOW()
      )
  `;
  let data = [
    queryData.USERID,
    queryData.REFERENCEID,
    queryData.REASON
  ]
  return queryDispatcher(query, data)
}
