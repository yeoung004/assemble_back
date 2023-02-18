const { sendQuery } = require("../middleware/mysql")
const queryDispatcher = async (query, queryData) => {
  return await sendQuery(query, queryData, 'POST')
}

// -----------------------------COMMON-------------------------------------------
exports.getRecentPostedPostID = async (writerID) => {
  const query = `
        SELECT MAX(ID) AS ID
            FROM POST 
        WHERE WRITER = ?`
  const result = await queryDispatcher(query, [writerID])
  return result[0]?.ID
}

const getTagID = async (tag) => {
  const query = `SELECT TAGID FROM TAG WHERE TAG = ?`;
  const result = await queryDispatcher(query, [tag])
  return result[0]?.TAGID
}

// -----------------------------INSERT-------------------------------------------
exports.insertPost = (queryData) => {
  let query = `
    INSERT INTO POST(
		WRITER,
		TEXT,
        PROJECT_ID,
		UPLOAD_TIME,
        CONTENT_LINK,
        CONTENT_TYPE
    )VALUES (
        ?,
        ?,
        ?,
        NOW(),
        ?,
        ?
    )`;
  let data = [
    queryData.WRITER,
    queryData.TEXT,
    queryData.PROJECT_ID,
    queryData.CONTENT_LINK,
    queryData.CONTENT_TYPE
  ]
  return queryDispatcher(query, data)
}

exports.insertTags = async (tags = []) => {
  let query = `INSERT INTO TAG (TAG) VALUES`;
  let temp = []

  tags.forEach((value) => {
    query += '(?),'
    temp.push(value)
  })
  await queryDispatcher(query.slice(0, -1), temp)
}

exports.insertPostTag = async (queryData) => {
  let query = `
    INSERT INTO POST_TAG (
            TAGID,
            POST_ID
        ) VALUES `;
  let yetList = []
  const insertQuery = `
        SELECT MAX(ID) AS ID
            FROM POST 
        WHERE WRITER = ?`
  const result = await queryDispatcher(insertQuery, [queryData.WRITER])
  const postID = result[0]?.ID
  for (let tag of queryData.TAGS) {
    let tagID = await getTagID(tag)
    if (tagID)
      query += `(${tagID}, ${postID}),`
    else
      yetList.push(tag)
  }
  if (yetList.length) {
    await this.insertTags(yetList)
    for (let tag of yetList) {
      const tagID = await getTagID(tag)
      query += `(${tagID}, ${postID}),`
    }
  }
  await queryDispatcher(query.slice(0, -1), [])
}

exports.insertLiked = async (queryData) => {
  const query = `INSERT 
            INTO LIKED(
                LIKED_AT,
                LIKER,
                POSTID
            )VALUES(
                NOW(),
                ?,
                ?)`;
  await queryDispatcher(query, [queryData.LIKER, queryData.POSTID])
}

exports.insertComment = async (queryData) => {
  const query = `INSERT INTO COMMENT (
                WRITER,
                POSTID,
                WRITED_AT,
                COMMENT
            )VALUES(
                ?,
                ?,
                NOW(),
                ?
            )`;
  await queryDispatcher(query, [queryData.WRITER, queryData.POSTID, queryData.COMMENT])
}

// -----------------------------SELECT-------------------------------------------
exports.selectCommentAndLikedCount = (queryData) => {
  const query = `SELECT 
	(SELECT COUNT(ID) FROM LIKED WHERE POSTID = ?) AS LIKED,
	(SELECT COUNT(ID) FROM COMMENT WHERE POSTID = ?) AS COMMENT`
  return queryDispatcher(query, [queryData.POSTID])

}

exports.selectPosts = (queryData) => {
  let data = [queryData.ID, queryData.ID, queryData.ID]
  const blockQuery = `p.WRITER NOT IN (
      SELECT REFERENCEID FROM BLOCK WHERE USERID = ?
    )`
  let query = `SELECT DISTINCT
                    p.*,
                    pr.PROJECT_NAME,
                    ui.USER_NAME,
                    ui.PROFILE_URL,
                    (SELECT COUNT(ID) 
                        FROM LIKED 
                        WHERE POSTID = p.ID 
                        AND LIKER = ?) as ISLIKED,
                    (SELECT COUNT(ID)
                        FROM PROJECT_MEMBER 
                        WHERE PROJECTID = pr.ID
                        AND MEMBERID = ?) as ISMEMBEROFPROJECT,
                    (SELECT COUNT(ID) 
                        FROM COMMENT
                        WHERE POSTID = p.ID) as COMMENTS,
                    (SELECT COUNT(ID) 
                        FROM LIKED
                        WHERE POSTID = p.ID) as LIKEDS
                FROM POST p
                LEFT JOIN PROJECT pr 
                    on pr.ID = p.PROJECT_ID 
                LEFT JOIN USER_INFO ui 
                    ON ui.id = p.WRITER
                LEFT JOIN LIKED l 
                    ON l.POSTID = p.ID
                LEFT JOIN COMMENT c 
                    ON c.POSTID = p.ID \n`;

  if (queryData?.POSTID) {
    query += `WHERE ${blockQuery} AND p.ID > ?\n`
    data.push(queryData.POSTID)
  } else if (queryData?.PREPOSTID) {
    query += `WHERE ${blockQuery} AND p.ID < ?\n`
    data.push(queryData.PREPOSTID)
  }
  if (queryData?.SEARCHTXT) {
    query += `LEFT JOIN POST_TAG PT 
            ON PT.POST_ID = P.ID
        LEFT JOIN TAG T 
            ON T.TAGID = PT.TAGID 
        WHERE ${blockQuery} 
            AND p.TEXT LIKE ? 
            OR T.TAG LIKE ? 
        ORDER BY ID DESC`
    data.push('%' + queryData.SEARCHTXT + '%')
    data.push('%' + queryData.SEARCHTXT + '%')
  } else {
    query += `
      ORDER BY ID DESC
      LIMIT 5`;
  }

  return queryDispatcher(query, data)
}

exports.selectPost = (queryData) => {
  const query = `SELECT PROFILE_URL FROM USER_INFO WHERE ID = ?`;
  return queryDispatcher(query, [queryData.ID])
}

exports.selectComment = (queryData) => {
  const query = `SELECT 
        C.ID,
        C.POSTID,
        C.WRITER,
        C.WRITED_AT,
        C.COMMENT,
        UI.USER_NAME,
        UI.PROFILE_URL
    FROM COMMENT C
    LEFT JOIN USER_INFO UI 
    ON UI.ID = C.WRITER
    WHERE POSTID = ?
    ORDER BY C.WRITED_AT DESC`;
  return queryDispatcher(query, [queryData.POSTID])
}

exports.selectLiked = (queryData) => {
  const query = `SELECT 
            L.ID,
            UI.PROFILE_URL,
            UI.USER_NAME,
            UI.ID AS USER_ID
        FROM LIKED L 
        LEFT JOIN USER_INFO UI 
        ON UI.ID = L.LIKER
        WHERE L.POSTID = ?
        ORDER BY L.LIKED_AT DESC`;
  return queryDispatcher(query, [queryData.POSTID])
}

exports.selectPostTag = (queryData) => {
  const query = `SELECT 
                t.TAG 
            FROM POST_TAG pt 
            LEFT JOIN TAG t 
            ON t.TAGID = pt.TAGID 
            WHERE pt.POST_ID = ?`;
  return queryDispatcher(query, [queryData.POSTID])
}

exports.selectProject = (queryData) => {
  const query = `
    SELECT 
        P.PROJECT_NAME,
        P.ID
    FROM PROJECT P
    LEFT JOIN PROJECT_MEMBER PM
        ON PM.PROJECTID = P.ID
    WHERE PM.MEMBERID = ?`;
  return queryDispatcher(query, [queryData.ID])
}

// -----------------------------UPDATE-------------------------------------------
exports.updatePost = (queryData) => {
  const query = `
    UPDATE POST SET
        TEXT = ?,
        CONTENT_LINK = ?,
        CONTENT_TYPE = ?,
        PROJECT_ID = ?
    WHERE ID = ?`;
  return queryDispatcher(query, [
    queryData.TEXT,
    queryData.CONTENT_LINK,
    queryData.CONTENT_TYPE,
    queryData.PROJECT_ID,
    queryData.POSTID,
  ])
};

exports.updateComment = (queryData) => {
  const query = `
    UPDATE COMMENT SET 
        COMMENT = ?
    WHERE POSTID = ?
    AND ID = ?`;
  return queryDispatcher(query, [
    queryData.COMMENT,
    queryData.POSTID,
    queryData.COMMENTID
  ])
};

exports.updatePostTag = (queryData) => {
  const query = `
    UPDATE POST SET
        TEXT = ?,
        CONTENT_LINK = ?,
        CONTENT_TYPE = ?
    WHERE WRITER = ?`;
  return queryDispatcher(query, [
    queryData.TEXT,
    queryData.CONTENT_LINK,
    queryData.CONTENT_TYPE,
    queryData.WRITER
  ])
};

// -----------------------------DELETE-------------------------------------------
exports.deletePostTag = async (POSTID) => {
  const query = `DELETE FROM POST_TAG WHERE POST_ID = ?`;
  return queryDispatcher(query, [POSTID])
}

exports.deletePost = async (queryData) => {
  const query = `DELETE FROM POST WHERE ID = ?`
  return queryDispatcher(query, [queryData.POSTID])
}

exports.deleteComment = async (queryData) => {
  const query = `DELETE FROM COMMENT WHERE ID = ?`;
  return queryDispatcher(query, [queryData.COMMENTID])
}

exports.deleteLiked = (queryData) => {
  const query = `
        DELETE 
            FROM LIKED 
        WHERE LIKER = ? 
            AND POSTID = ?
    `;
  return queryDispatcher(query, [queryData.LIKER, queryData.POSTID])
};
