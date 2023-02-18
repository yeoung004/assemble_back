const { sendQuery } = require("../middleware/mysql")
const queryDispatcher = async (query, queryData) => {
  return await sendQuery(query, queryData, 'MEMBER')
}

// ------------------------INSERT------------------------
exports.requestProject = async (queryData) => {
  let query = `
    INSERT INTO PROJECT_MEMBER(
        MEMBERID,
        PROJECTID, 
        SIGNEDUP_AT,
        ROLE,
        STATE
      )
      VALUES(
        ?,
        ?,
        NOW(),
        ?,
        2
      )`
  return queryDispatcher(query, [
    queryData.MEMBERID,
    queryData.PROJECTID,
    queryData.ROLE
  ])
}

exports.addMembers = async (PROJECTID, MEMBER, LEADER_ID) => {
  let members = []
  let query = `
    INSERT INTO PROJECT_MEMBER(
        MEMBERID,
        PROJECTID, 
        SIGNEDUP_AT,
        ROLE,
        STATE)`
  MEMBER.map((member, index) => {
    query += `
      VALUES(
        ?,
        ?,
        NOW(),
        ?,
        ${LEADER_ID == member.MEMBERID ? 1 : 0}
      ),`
    members.push(member.MEMBERID)
    members.push(PROJECTID)
    members.push(member.ROLE)
  })
  query = query.slice(0, query.length - 1)
  return queryDispatcher(query, members)
}


// ------------------------SELECT------------------------
exports.getMemberInvite = async (ID) => {
  const query = `
    SELECT 
      PM.ID, 
      PM.MEMBERID, 
      PM.PROJECTID, 
      PM.SIGNEDUP_AT, 
      PM.ROLE, 
      UI.PROFILE_URL,
      UI.USER_NAME,
      P.PROJECT_NAME,
      PM.STATE
    FROM PROJECT_MEMBER PM 
      LEFT JOIN PROJECT P 
      ON P.ID = PM.PROJECTID 
      LEFT JOIN USER_INFO UI 
      ON UI.ID = PM.MEMBERID  
    WHERE PM.MEMBERID = ?
    AND PM.STATE = 0
    `
  return queryDispatcher(query, [ID])
}

exports.getMemberRequest = async (ID) => {
  const query = `
    SELECT 
      PM.ID, 
      PM.MEMBERID, 
      PM.PROJECTID, 
      PM.SIGNEDUP_AT, 
      PM.ROLE, 
      UI.PROFILE_URL,
      UI.USER_NAME,
      P.PROJECT_NAME,
      PM.STATE
    FROM PROJECT_MEMBER PM 
      LEFT JOIN PROJECT P 
      ON P.ID = PM.PROJECTID 
      LEFT JOIN USER_INFO UI 
      ON UI.ID = PM.MEMBERID
    WHERE P.LEADER_ID = ?
    AND STATE = 2
    `
  return queryDispatcher(query, [ID])
}

exports.getMemberTech = async (MEMBERID) => {
  const query = `
      SELECT T.TECH_NAME 
        FROM USER_SKILL US
        LEFT JOIN TECH T 
        ON US.TECH_ID = T.ID  
      WHERE USER_ID = ?
    `
  return queryDispatcher(query, [MEMBERID])
}

exports.getMembers = async (PROJECTID) => {
  const query = `
      SELECT 
        PM.*,
        UI.PROFILE_URL,
        UI.USER_NAME 
      FROM PROJECT_MEMBER PM 
      LEFT JOIN PROJECT P 
      ON P.ID = PM.PROJECTID
      LEFT JOIN USER_INFO UI 
      ON UI.ID = PM.MEMBERID 
      WHERE P.ID = ?
      AND PM.STATE = 1
    `
  return queryDispatcher(query, [PROJECTID])
}

// ------------------------UPDATE------------------------
exports.acceptMember = async (PROJECTID,  MEMBERID) => {
  const query = `
    UPDATE PROJECT_MEMBER SET 
      STATE = 1
    WHERE PROJECTID = ?
    AND MEMBERID = ?`
  return queryDispatcher(query, [PROJECTID, MEMBERID])
}
exports.editProjectMember = async (queryData) => {
  const query = `
    UPDATE PROJECT_MEMBER SET 
      ROLE = ?
    WHERE PROJECTID = ? 
    AND MEMBERID = ?
    `
  return queryDispatcher(query, [
    queryData.ROLE,
    queryData.PROJECTID,
    queryData.MEMBERID
  ])
}
// ------------------------DELETE------------------------
exports.removeMember = async (ID) => {
  const query = `DELETE FROM PROJECT_MEMBER WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeProjectMemeber = async (queryData) => {
  const query = `
  DELETE FROM PROJECT_MEMBER 
    WHERE MEMBERID = ?
      AND PROJECTID = ?`
  return queryDispatcher(query, [
    queryData.MEMBERID,
    queryData.PROJECTID
  ])
}

exports.removeAllMembers = async (PROJECTID) => {
  const query = `DELETE FROM PROJECT WHERE PROJECTID = ?`
  return queryDispatcher(query, [PROJECTID])
}


