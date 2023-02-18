const { Model } = require('sequelize');
const { sendQuery } = require("../middleware/mysql")
const queryDispatcher = async (query, queryData) => {
  return await sendQuery(query, queryData, 'USER')
}

// -----------------------------COMMON-------------------------------------------
exports.getAllUsers = () => {
  const query = `SELECT ID, USER_NAME FROM USER_INFO`;
  return queryDispatcher(query, [])
}

// -----------------------------SELECT-------------------------------------------
exports.selectUserProfileUrl = (queryData) => {
  const query = `SELECT PROFILE_URL FROM USER_INFO WHERE ID=?`;
  return queryDispatcher(query, [queryData.ID])
}


exports.selectUser = (queryData) => {
  const query = 'SELECT COUNT(*) AS isExisted FROM USER_INFO WHERE ID=?'
  return queryDispatcher(query, [queryData.ID])
}

exports.selectUserInfo = (queryData) => {
  let queryArry = []
  let query = `SELECT *`
  if (queryData?.COWORKERID) {
    queryArry.push(queryData.COWORKERID)
    queryArry.push(queryData.ID)
    queryArry.push(queryData.ID)
    queryArry.push(queryData.COWORKERID)
    query += `,
            (SELECT COUNT(ID) 
                FROM REQUEST 
            WHERE SENDERID = ?
            AND RECEIVERID = ?
            AND REQUEST_TYPE = 1) AS ISASSEMBLING ,
            (SELECT COUNT(ID)  
                FROM COWORKER C
            WHERE USERID = ?
            AND COWORKERID = ?) AS ISCOWORKER\n`
  }
  query += `FROM USER_INFO 
    WHERE ID = ?`
  queryArry.push(queryData.ID)
  return queryDispatcher(query, queryArry)
}

exports.selectUserCareers = (queryData) => {
  const query = 'SELECT COMPANY, WORK, START_DATE, END_DATE FROM CAREER WHERE USER_ID=?'
  return queryDispatcher(query, [queryData.ID])
}

exports.selectUserSkills = (queryData) => {
  const query = `
        SELECT t.TECH_NAME AS SKILL FROM USER_SKILL us
            LEFT JOIN TECH t ON t.ID = us.TECH_ID 
        WHERE us.USER_ID = ?`;
  return queryDispatcher(query, [queryData.ID])
}

exports.selectUserInterests = (queryData) => {
  const query = `
        SELECT t.TECH_NAME AS INTEREST FROM USER_INTEREST ui
            LEFT JOIN TECH t ON t.ID = ui.TECH_ID 
        WHERE ui.USER_ID = ?`;
  return queryDispatcher(query, [queryData.ID])
}

exports.selectChatUsers = (userIDs = []) => {
  let query = `
        SELECT 
            PROFILE_URL,
            USER_NAME 
        FROM USER_INFO 
        WHERE ID = ?`
  query += `
            OR ID = ?
        `.repeat(userIDs.length - 1)
  return queryDispatcher(query, userIDs)
}

exports.selectRequest = (queryData) => {
  const query = `
        SELECT 
            R.ID,
            UI.ID AS USERID,
            UI.PROFILE_URL,
            UI.USER_NAME
        FROM REQUEST R 
    LEFT JOIN USER_INFO UI 
    ON UI.ID = R.SENDERID  
    WHERE R.RECEIVERID = ?
    AND R.REQUEST_TYPE = 1`
  return queryDispatcher(query, [queryData.ID])
}

exports.selectAssemble = (queryData) => {
  const query = `
        SELECT SENDERID 
        FROM REQUEST
        WHERE RECEIVERID = ?
        AND REQUEST_TYPE = 1`
  return queryDispatcher(query, [queryData.ID])
}

exports.selectNotification = (queryData) => {
  const query = `
      SELECT 
        N.*,
        UI.USER_NAME 
      FROM NOTIFICATION N 
        LEFT JOIN USER_INFO UI 
        ON UI.ID = N.FROM_USER_ID 
      WHERE TO_USER_ID = ?`
  return queryDispatcher(query, [queryData.ID])
}

exports.selectBlock = (queryData) => {
  const query = `
        SELECT
            COWORKERID 
        FROM COWORKER
        WHERE USERID = ?
        AND ISBLOCKED = 1`;
  return queryDispatcher(query, [queryData.ID])
}

exports.selectCoworker = (queryData) => {
  const query = `SELECT
        C.*,
        UI.USER_NAME,
        UI.PROFILE_URL
    FROM COWORKER C
        LEFT JOIN USER_INFO UI
        ON C.COWORKERID = UI.ID
    WHERE C.USERID = ?`;
  return queryDispatcher(query, [queryData.ID])
}

// -----------------------------INSERT-------------------------------------------
exports.insertUserInfo = (queryData, country, ip, city) => {
  const query = `
        INSERT 
            INTO USER_INFO(
                ID,
                EMAIL,
                LAST_LOGIN_TIME,
                COUNTRY,
                USER_NAME,
                PROFILE_URL,
                JOB,
                DEV_POSITION,
                GITHUB,
                WEBPAGE,
                GENDER,
                BIRTH,
                EXPERIENCE,
                ACCESSED_IP,
                ACCESSED_COUNTRY,
                ACCESSED_CITY
                )VALUES(?,?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  return queryDispatcher(query, [
    queryData.ID,
    queryData.EMAIL,
    queryData.COUNTRY,
    queryData.USER_NAME,
    queryData.PROFILE_URL,
    queryData.JOB,
    queryData.DEV_POSITION,
    queryData.GITHUB,
    queryData.WEBPAGE,
    queryData.GENDER,
    queryData.BIRTH,
    queryData.EXPERIENCE,
    ip,
    country,
    city
  ])
};

exports.insertCoworker = async (queryData) => {
  const query = `INSERT INTO COWORKER (USERID, COWORKERID, LINKED_AT) VALUES (?, ?, now()), (?, ?, now()) `;
  return await queryDispatcher(query, [queryData.USERID, queryData.COWORKERID, queryData.COWORKERID, queryData.USERID])
}

exports.insertNotification = async (queryData) => {
  const query = `
  INSERT INTO NOTIFICATION(
    DATE, 
    TYPE, 
    FROM_USER_ID, 
    TO_USER_ID
  )VALUES(
    NOW(), 
    ?, 
    ?, 
    ?
  )`
  return await queryDispatcher(query, [
    queryData.TYPE, 
    queryData.FROM_USER_ID, 
    queryData.TO_USER_ID
  ])
}

exports.insertAssemble = async (queryData) => {
  const query = `
    INSERT INTO REQUEST(
        SENDERID, 
        SENT_AT, 
        REQUEST_TYPE, 
        RECEIVERID
    )VALUES(
        ?,
        NOW(),
        1,
        ?
    )`
  return await queryDispatcher(query, [queryData.SENDERID, queryData.RECEIVERID])
}

exports.insertUserSkills = async (queryData) => {
  const { SKILLS } = queryData;
  let query = `INSERT INTO USER_SKILL(USER_ID, TECH_ID) VALUES `
  let data = []
  if (SKILLS?.length > 0)
    SKILLS.forEach((skill) => {
      query += `(?,(SELECT ID FROM TECH WHERE TECH_NAME = ?)),`
      data.push(queryData.ID, skill)
    })
  query = query.slice(0, -1)
  await queryDispatcher(query, data)
}

exports.insertUserCareers = (queryData) => {
  const { CAREERS } = queryData;
  let cnt = 0;
  const query = `INSERT INTO CAREER(COMPANY, WORK, START_DATE, END_DATE, USER_ID)VALUES(?,?,?,?,?)`;

  if (Object.keys(CAREERS).length != 0)
    Object.keys(CAREERS).map(career => {
      queryDispatcher(query, [CAREERS[career].COMPANY, CAREERS[career].WORK, CAREERS[career].START_DATE, CAREERS[career].END_DATE, queryData.ID])
      cnt++
    })
  return cnt;
};

exports.insertUserInterests = async (queryData) => {
  const { INTERESTS } = queryData;
  let query = `INSERT INTO USER_INTEREST(USER_ID, TECH_ID) VALUES `
  let data = []
  if (INTERESTS?.length > 0)
    INTERESTS.forEach((skill) => {
      query += `(?,(SELECT ID FROM TECH WHERE TECH_NAME = ?)),`
      data.push(queryData.ID, skill)
    })
  query = query.slice(0, -1)
  await queryDispatcher(query, data)
}

// -----------------------------UPDATE-------------------------------------------
exports.updateUserInfo = (queryData) => {
  const query = `
    UPDATE USER_INFO SET
        COUNTRY = ?,
        USER_NAME = ?,
        PROFILE_URL = ?,
        JOB = ?,
        DEV_POSITION = ?,
        GITHUB = ?,
        WEBPAGE = ?,
        GENDER = ?,
        BIRTH = ?,
        EXPERIENCE = ?
    WHERE ID = ?`;
  return queryDispatcher(query, [
    queryData.COUNTRY,
    queryData.USER_NAME,
    queryData.PROFILE_URL,
    queryData.JOB,
    queryData.DEV_POSITION,
    queryData.GITHUB,
    queryData.WEBPAGE,
    queryData.GENDER,
    queryData.BIRTH,
    queryData.EXPERIENCE,
    queryData.ID
  ])
};

exports.updateUserAccessedInfo = (queryData, COUNTRY, IP, CITY) => {
  const query = `
        UPDATE USER_INFO SET
            LAST_LOGIN_TIME = NOW(),
            ACCESSED_IP = ?,
            ACCESSED_COUNTRY = ?,
            ACCESSED_CITY = ?,
            EXPO_PUSH_TOKEN = ?,
            DEVICE = ?,
            OS = ?,
            OS_VERSION = ?
        WHERE ID = ?`;
  return queryDispatcher(query, [
    IP,
    COUNTRY,
    CITY,
    queryData.EXPO_PUSH_TOKEN,
    queryData.DEVICE,
    queryData.OS,
    queryData.OS_VERSION,
    queryData.ID
  ])
};

exports.updateAllowEmail = (queryData) => {
  const query = `
    UPDATE USER_INFO 
      SET ALLOW_EMAIL = ?
    WHERE ID = ?`
  return queryDispatcher(query, [queryData.ALLOW_EMAIL, queryData.USERID])
}

exports.updateAllowChat = (queryData) => {
  const query = `
    UPDATE USER_INFO 
      SET ALLOW_CHAT = ?
    WHERE ID = ?`
  return queryDispatcher(query, [queryData.ALLOW_CHAT, queryData.USERID])
}

exports.updateCoworkerBlockState = (queryData) => {
  const query = `
    UPDATE COWORKER SET 
        ISBLOCKED = NOT ISBLOCKED 
    WHERE USERID = ? 
    AND COWORKERID = ?`;
  return queryDispatcher(query, [queryData.USERID, queryData.COWORKERID])
};

exports.updateCoworker = (queryData) => {
  const query = `UPDATE COWORKER SET
            LINKED_AT = NOW()
            WHERE (USERID = ?
                AND COWORKERID = ?
                AND LINKED_AT IS NULL) 
            OR (USERID = ?
                AND COWORKERID = ?
                AND LINKED_AT IS NULL)`;
  return queryDispatcher(query, [
    queryData.USERID,
    queryData.COWORKERID,
    queryData.COWORKERID,
    queryData.USERID
  ])
};

// -----------------------------DELETE-------------------------------------------
exports.deleteColumns = (queryData, tableName) => {
  const query = `DELETE FROM ${tableName} WHERE USER_ID = ?`
  return queryDispatcher(query, [queryData.ID])
}

exports.deleteCoworker = (queryData) => {
  const query = `DELETE FROM COWORKER 
            WHERE (USERID = ?
                AND COWORKERID = ?
                AND LINKED_AT IS NULL) 
            OR (USERID = ?
                AND COWORKERID = ?
                AND LINKED_AT IS NULL)`
  return queryDispatcher(query, [
    queryData.USERID,
    queryData.COWORKERID,
    queryData.COWORKERID,
    queryData.USERID
  ])
}

exports.deleteRequest = (queryData) => {
  const query = `DELETE FROM REQUEST WHERE ID = ?`
  return queryDispatcher(query, [queryData.REQUESTID])
}

exports.deleteUser = (queryData) => {
  const query = `DELETE FROM USER_INFO WHERE ID = ?`
  return queryDispatcher(query, [queryData.USERID])
}

exports.deleteANotification = (queryData) => {
  const query = `DELETE FROM NOTIFICATION WHERE ID = ?`
  return queryDispatcher(query, [queryData.ID])
}

exports.deleteNotifications = (queryData) => {
  const query = `DELETE FROM NOTIFICATION WHERE TO_USER_ID = ?`
  return queryDispatcher(query, [queryData.ID])
}