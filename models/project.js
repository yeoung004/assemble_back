const { sendQuery } = require("../middleware/mysql")
const queryDispatcher = async (query, queryData) => {
  return await sendQuery(query, queryData, 'PROJECT')
}

// -------------------------------------CREATE-------------------------------------
exports.createTag = async (tags = []) => {
  let queryData = []
  let query = `INSERT INTO TAG(TAG) `
  tags.forEach((tag, index) => {
    query += `
      SELECT 
        TAG
      FROM (SELECT ? AS TAG) AS TAG
    WHERE NOT EXISTS (SELECT TAGID FROM TAG WHERE TAG = ?)
    UNION`
    queryData.push(tag)
    queryData.push(tag)
  })
  query = query.slice(0, query.length - 5)
  return queryDispatcher(query, queryData)
}
exports.addRequest = async (SENDERID, PROJECTID, members) => {
  let queryData = []
  let query = `
    INSERT INTO REQUEST(
      SENDERID, 
      REQUEST_TYPE,
      RECEIVERID,
      SENT_AT,
      INFO
    )VALUES`

  members.map((member) => {
    if (SENDERID != member.MEMBERID) {
      query += `(
          ?, 
          ?, 
          ?, 
          NOW(), 
          ?
        ),`
      queryData.push(SENDERID)
      queryData.push(2)
      queryData.push(member.MEMBERID)
      queryData.push(PROJECTID)
    }
  })
  query = query.slice(0, query.length - 1)
  return queryDispatcher(query, queryData)
}

exports.createProject = async (queryData) => {
  const query = `
    INSERT INTO PROJECT(
        LEADER_ID, 
        CREATE_AT, 
        PROJECT_NAME, 
        GITHUB, 
        FIGMA, 
        PROFILE,
        WEB
    )VALUES(
        ?, 
        NOW(),
        ?, 
        ?, 
        ?, 
        ?,
        ?)`
  return queryDispatcher(query, [
    queryData.LEADER_ID,
    queryData.PROJECT_NAME,
    queryData.GITHUB,
    queryData.FIGMA,
    queryData.PROFILE,
    queryData.WEB
  ])
}
exports.addTaskWorker = async (TASKID, workers) => {
  let queryData = []
  let query = `
    INSERT INTO PROJECT_TASK_WORKER(
      WORKERID,
      TASKID 
      )VALUES`
  workers.map((worker) => {
    query += `(
          ?,
          ?
        ),`
    queryData.push(worker)
    queryData.push(TASKID)
  })
  query = query.slice(0, query.length - 1)
  return queryDispatcher(query, queryData)
}


exports.addTask = async (queryData) => {
  const query = `
    INSERT INTO PROJECT_TASK(
      UPLOADER,
      UPLOAD_AT,
      START,
      END,
      TITLE,
      CONTENT,
      PROJECTID
    )VALUES(
      ?,
      NOW(),
      ?,
      ?,
      ?,
      ?,
      ?
    )`
  return queryDispatcher(query, [
    queryData.UPLOADER,
    queryData.START,
    queryData.END,
    queryData.TITLE,
    queryData.CONTENT,
    queryData.PROJECTID
  ])
}

exports.addProjectIssue = async (queryData) => {
  const query = `
    INSERT INTO 
      PROJECT_ISSUE(
        TITLE,
        CONTENT,
        UPLOADER,
        UPLOAD_AT,
        REFERENCE,
        PROJECTID,
        TYPE
      )VALUES(
        ?,
        ?,
        ?,
        NOW(),
        ?,
        ?,
        ?
      )`
  return queryDispatcher(query, [
    queryData.TITLE,
    queryData.CONTENT,
    queryData.UPLOADER,
    queryData.REFERENCE,
    queryData.PROJECTID,
    queryData.TYPE
  ])
}

exports.addProjectMemo = async (queryData) => {
  const query = `
      INSERT INTO PROJECT_MEMO (
        PROJECTID,
        WRITER,
        TITLE,
        CONTENT,
        UPDATED_AT 
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        NOW()
      )`
  return queryDispatcher(query, [
    queryData.PROJECTID,
    queryData.WRITER,
    queryData.TITLE,
    queryData.CONTENT
  ])
}

exports.addProjectTech = async (PROJECTID, TECHS) => {
  let techs = []
  let query = `
    INSERT INTO PROJECT_TECH(
        PROJECTID,
        TECHID
    )VALUES `
  TECHS.forEach((tech, index) => {
    query += `(?, (SELECT ID FROM TECH WHERE TECH_NAME = ?)),`
    techs.push(PROJECTID)
    techs.push(tech)
  })
  query = query.slice(0, query.length - 1)
  return queryDispatcher(query, techs)
}

exports.addProjectTag = async (PROJECTID, TAGS) => {
  let tags = []
  let query = `
    INSERT INTO PROJECT_TAG(
        PROJECTID,
        TAGID
    )VALUES `
  TAGS.forEach((tag, index) => {
    query += `(?, (SELECT TAGID FROM TAG WHERE TAG = ?)),`
    tags.push(PROJECTID)
    tags.push(tag)
  })
  query = query.slice(0, query.length - 1)
  return queryDispatcher(query, tags)
}

// -------------------------------------SELECT-------------------------------------
exports.getProjects = async ({ USERID }) => {
  const query = `
        SELECT P.* 
        FROM PROJECT P 
            LEFT JOIN PROJECT_MEMBER PM 
            ON PM.PROJECTID = P.ID
        WHERE PM.MEMBERID = ? 
        AND PM.STATE = 1
    `
  return queryDispatcher(query, [USERID])
}

exports.getProject = async (ID) => {
  const query = `SELECT * FROM PROJECT WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.getTags = async (ID) => {
  const query = `
    SELECT T.TAG AS TAG
      FROM PROJECT_TAG PT
      LEFT JOIN TAG T ON T.TAGID = PT.TAGID 
      WHERE PT.PROJECTID = ?`
  return queryDispatcher(query, [ID])
}
exports.getMonthTask = async (queryData) => {
  const query = `
    SELECT DISTINCT DATE_FORMAT(START, '%Y-%m-%d') AS DAY 
      FROM PROJECT_TASK
    WHERE PROJECTID = ?
      AND MONTH(START) = ?
      ORDER BY DAY`
  return queryDispatcher(query, [
    queryData.PROJECTID,
    queryData.MONTH
  ])
}

exports.getDayTasks = async (queryData) => {
  const query = `
  SELECT 
    PT.START, 
    PT.TITLE, 
    PT.ISDONE 
  FROM PROJECT_TASK PT
  LEFT JOIN PROJECT_TASK_WORKER PTW 
  ON PTW.TASKID = PT.ID 
  WHERE DATE_FORMAT(PT.START, '%y-%m-%d') = DATE_FORMAT(NOW(), '%y-%m-%d') 
  AND PT.PROJECTID = ?
  AND PTW.WORKERID = ?
  ORDER BY PT.START`
  return queryDispatcher(query, [
    queryData.PROJECTID,
    queryData.WORKERID
  ])
}

exports.getTasks = async (queryData) => {
  const query = `
  SELECT 
    PT.*, 
    UI.USER_NAME AS UPLOADERNAME
  FROM PROJECT_TASK PT
    LEFT JOIN USER_INFO UI 
    ON PT.UPLOADER = UI.ID 
  WHERE MONTH(PT.START) = ?
    AND DAY(PT.START) = ?
    AND PT.PROJECTID = ?
    ORDER BY ISDONE, START`
  return queryDispatcher(query, [
    queryData.MONTH,
    queryData.DAY,
    queryData.PROJECTID
  ])
}

exports.getSimpleTask = async (USERID, MONTH) => {
  const query = `
    SELECT 
      PT.*,
      P.PROJECT_NAME
    FROM PROJECT_MEMBER PM 
    LEFT JOIN PROJECT P
    ON P.ID = PM.PROJECTID 
    LEFT JOIN PROJECT_TASK PT 
      ON PT.PROJECTID = PM.PROJECTID 
    WHERE PM.MEMBERID = ?
      AND PM.STATE = 1
      AND NOT PT.ISDONE = 1
      AND MONTH(PT.START) = ?
    ORDER BY START`
  return queryDispatcher(query, [USERID, MONTH])
}

exports.getSimpleIssues = async (USERID) => {
  const query = `
    SELECT
      PE.*,
      P.PROJECT_NAME 
    FROM PROJECT_MEMBER PM 
    LEFT JOIN PROJECT P 
    ON P.ID = PM.PROJECTID 
    LEFT JOIN PROJECT_ISSUE PE
      ON PM.PROJECTID = PE.PROJECTID 
    WHERE PM.MEMBERID = ?
      AND PM.STATE = 1
      AND NOT PE.TYPE = 4`
  return queryDispatcher(query, [USERID])
}

exports.getIssues = async (PROJECTID) => {
  const query = `
    SELECT * 
      FROM PROJECT_ISSUE 
      WHERE PROJECTID = ?
    ORDER BY ID DESC`
  return queryDispatcher(query, [PROJECTID])
}

exports.getWorkers = async (ID) => {
  const query = `
    SELECT 
      TW.*, 
      UI.USER_NAME
    FROM PROJECT_TASK_WORKER TW
      LEFT JOIN USER_INFO UI 
      ON UI.ID = TW.WORKERID 
    WHERE TW.TASKID = ?`
  return queryDispatcher(query, [ID])
}

exports.getTask = async (ID) => {
  const query = `
    SELECT 
      PT.*,
      UI.USER_NAME AS UPLOADERNAME
    FROM PROJECT_TASK PT
    LEFT JOIN USER_INFO UI 
    ON UI.ID = PT.UPLOADER  
    WHERE PT.ID = ?`
  return queryDispatcher(query, [ID])
}

exports.getIssue = async (ID) => {
  const query = `
  SELECT * FROM PROJECT_ISSUE WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.getMemo = async (MEMOID) => {
  const query = `
    SELECT * 
    FROM PROJECT_MEMO 
      WHERE ID = ?
    ORDER BY ID DESC`
  return queryDispatcher(query, [MEMOID])
}

exports.getRequestCnt = async (ID) => {
  const query = `
    SELECT 
      COUNT(PM.ID) AS CNT
    FROM PROJECT_MEMBER PM 
      LEFT JOIN PROJECT P 
      ON P.ID = PM.PROJECTID 
    WHERE 
    (P.LEADER_ID = ? AND PM.STATE = 2) 
    OR (MEMBERID = ? AND STATE = 0)
      `
  return queryDispatcher(query, [ID, ID])
}

exports.getMemos = async (PROJECTID) => {
  const query = `
    SELECT * 
    FROM PROJECT_MEMO 
    WHERE PROJECTID = ?
    ORDER BY ID DESC`
  return queryDispatcher(query, [PROJECTID])
}
exports.getProjectTechs = async (ID) => {
  const query = `
  SELECT T.TECH_NAME AS TECH_NAME
    FROM PROJECT_TECH PT
    LEFT JOIN TECH T 
    ON T.ID = PT.TECHID
    WHERE PT.PROJECTID = ?`
  return queryDispatcher(query, [ID])
}
exports.getLeaderID = async (PROJECTID) => {
  const query = `
  SELECT LEADER_ID 
    FROM PROJECT
  WHERE ID = ?`
  return queryDispatcher(query, [PROJECTID])
}
exports.getProjectGole = async (queryData) => {
  const query = `
  SELECT 
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND DATE_FORMAT(START, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')) AS TEAM_MONTHTOTAL,
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND DATE_FORMAT(START, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
    AND ISDONE = TRUE) AS TEAM_MONTHDONE,
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') = ?) AS TEAM_DAYTOTAL,
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') = ?
    AND ISDONE = TRUE) AS TEAM_DAYDONE,
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') 
    BETWEEN ? AND ?) AS TEAM_WEEKTOTAL,
    (SELECT
      COUNT(ID) AS TOTAL
    FROM PROJECT_TASK
    WHERE PROJECTID = ?
    AND ISDONE = TRUE
    AND DATE_FORMAT(START,'%Y-%m-%d') 
    BETWEEN ? AND ?) AS TEAM_WEEKDONE,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND DATE_FORMAT(START, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')) AS ME_MONTHTOTAL,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND DATE_FORMAT(START, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
    AND ISDONE = TRUE) AS ME_MONTHDONE,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') = ?) AS ME_DAYTOTAL,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') = ?
    AND ISDONE = TRUE) AS ME_DAYDONE,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND DATE_FORMAT(START,'%Y-%m-%d') 
    BETWEEN ? AND ?) AS ME_WEEKTOTAL,
    (SELECT
      COUNT(PT.ID) AS TOTAL
    FROM PROJECT_TASK PT
    LEFT JOIN PROJECT_TASK_WORKER PTW 
    ON PTW.TASKID = PT.ID
    WHERE PROJECTID = ?
    AND PTW.WORKERID = ?
    AND ISDONE = TRUE
    AND DATE_FORMAT(START,'%Y-%m-%d') 
    BETWEEN ? AND ?) AS ME_WEEKDONE`
  return queryDispatcher(query, [
    queryData.PROJECTID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.FIRSTDAYOFWEEK,
    queryData.LASTDAYOFWEEK,
    queryData.PROJECTID,
    queryData.FIRSTDAYOFWEEK,
    queryData.LASTDAYOFWEEK,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.TODAY,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.FIRSTDAYOFWEEK,
    queryData.LASTDAYOFWEEK,
    queryData.PROJECTID,
    queryData.WORKERID,
    queryData.FIRSTDAYOFWEEK,
    queryData.LASTDAYOFWEEK
  ])
}

// -------------------------------------UPDATE-------------------------------------
exports.updateProfile = async (queryData) => {
  const query = `
    UPDATE PROJECT SET 
        PROFILE = ?
    WHERE ID = ?
    `
  return queryDispatcher(query, [
    queryData.PROFILE,
    queryData.PROJECTID
  ])
}

exports.changeLeader = async (params) => {
  const query = `
  UPDATE 
    PROJECT P
  SET
    P.LEADER_ID = ?
  WHERE P.ID = ?`
  return queryDispatcher(query, [
    params.LEADER_ID,
    params.ID
  ])
}

exports.editProject = async (queryData) => {
  const query = `
    UPDATE PROJECT SET
      PROJECT_NAME = ?,
      GITHUB = ?,
      WEB = ?,
      FIGMA = ?,
      PROFILE = ?
    WHERE ID = ?
    `
  return queryDispatcher(query, [
    queryData.PROJECT_NAME,
    queryData.GITHUB,
    queryData.WEB,
    queryData.FIGMA,
    queryData.PROFILE,
    queryData.ID
  ])
}

exports.editProjectMemo = async (queryData) => {
  const query = `
  UPDATE PROJECT_MEMO SET 
    WRITER = ?,
    TITLE  = ?,
    CONTENT = ?,
    UPDATED_AT = NOW()
  WHERE ID = ?`
  return queryDispatcher(query, [
    queryData.WRITER,
    queryData.TITLE,
    queryData.CONTENT,
    queryData.MEMOID,
  ])
}

exports.doneTask = async (ID, ISDONE) => {
  const query = `
    UPDATE PROJECT_TASK SET
      ISDONE = ?
    WHERE ID = ?`
  return queryDispatcher(query, [ISDONE, ID])
}

exports.editTask = async (queryData) => {
  const query = `
    UPDATE PROJECT_TASK SET
      TITLE = ?,
      CONTENT = ?,
      START = ?,
      END = ?
    WHERE ID = ?`
  return queryDispatcher(query, [
    queryData.TITLE,
    queryData.CONTENT,
    queryData.START,
    queryData.END,
    queryData.ID
  ])
}

exports.editIssue = async (queryData) => {
  const query = `
    UPDATE PROJECT_ISSUE SET
      UPLOADER = ?,
      UPLOAD_AT = NOW(),
      REFERENCE = ?,
      TYPE = ?,
      TITLE = ?,
      CONTENT = ?
    WHERE ID = ?`
  return queryDispatcher(query, [
    queryData.UPLOADER,
    queryData.REFERENCE,
    queryData.TYPE,
    queryData.TITLE,
    queryData.CONTENT,
    queryData.ID
  ])
}

// -------------------------------------DELETE-------------------------------------
exports.deleteProject = async (ID) => {
  const query = `DELETE FROM PROJECT WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeProjectTask = async (ID) => {
  const query = `
  DELETE PTW, PT
    FROM PROJECT_TASK_WORKER PTW
  LEFT JOIN PROJECT_TASK PT
    ON PT.ID = PTW.TASKID 
  WHERE PT.PROJECTID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeIssue = async (ID) => {
  const query = `DELETE FROM PROJECT_ISSUE WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeProjectTag = async (PROJECTID) => {
  const query = `DELETE FROM PROJECT_TAG WHERE PROJECTID = ?`
  return queryDispatcher(query, [PROJECTID])
}

exports.removeProjectTech = async (PROJECTID) => {
  const query = `DELETE FROM PROJECT_TECH WHERE PROJECTID = ?`
  return queryDispatcher(query, [PROJECTID])
}

exports.removeTask = async (ID) => {
  const query = `DELETE FROM PROJECT_TASK WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeAllTaskWorker = async (WORKERID, PROJECTID) => {
  const query = `
  DELETE 
    FROM PROJECT_TASK_WORKER 
    WHERE WORKERID = ?
    AND TASKID IN (
      SELECT PT.ID FROM PROJECT_TASK PT
      WHERE PT.PROJECTID = ?
    )`
  return queryDispatcher(query, [WORKERID, PROJECTID])
}

exports.removeTaskWorker = async (ID) => {
  const query = `DELETE FROM PROJECT_TASK_WORKER WHERE TASKID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeProject = async (ID) => {
  const query = `DELETE FROM PROJECT WHERE ID = ?`
  return queryDispatcher(query, [ID])
}

exports.removeProjectMemo = async (MEMOID) => {
  const query = `DELETE FROM PROJECT_MEMO WHERE ID = ?`
  return queryDispatcher(query, [MEMOID])
}