const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require('graphql')
const {
  getProjects,
  getProject,
  createProject,
  createTag,
  addProjectTag,
  addProjectTech,
  updateProfile,
  getTags,
  getProjectTechs,
  addProjectMemo,
  removeProjectMemo,
  editProjectMemo,
  addProjectIssue,
  editIssue,
  addTask,
  addTaskWorker,
  editTask,
  doneTask,
  getProjectGole,
  removeProject,
  getLeaderID,
  editProject,
  getTasks,
  getMonthTask,
  removeTask,
  removeTaskWorker,
  getDayTasks,
  removeAllTaskWorker,
  getSimpleTask,
  getSimpleIssues,
  getMemo,
  getMemos,
  getRequestCnt,
  getIssue,
  getIssues,
  removeIssue,
  changeLeader,
  getTask,
  getWorkers,
  removeProjectTag,
  removeProjectTech,
} = require('../models/project')
const {
  editProjectMember,
  addMembers,
  getMembers,
  getMemberTech,
  getMemberRequest,
  acceptMember,
  getMemberInvite,
  removeMember,
  requestProject,
  removeProjectMemeber,
} = require('../models/member')

const memberRequestType = new GraphQLObjectType({
  name: 'MemberRequest',
  fields: {
    ID: { type: GraphQLInt },
    USER_NAME: { type: GraphQLString },
    MEMBERID: { type: GraphQLString },
    PROJECTID: { type: GraphQLInt },
    PROJECT_NAME: { type: GraphQLString },
    SIGNEDUP_AT: { type: GraphQLString },
    ROLE: { type: GraphQLString },
    PROFILE_URL: { type: GraphQLString },
    STATE: { type: GraphQLInt },
  }
})
const workerType = new GraphQLObjectType({
  name: 'Worker',
  fields: {
    ID: { type: GraphQLInt },
    WORKERID: { type: GraphQLString },
    TASKID: { type: GraphQLInt },
    USER_NAME: { type: GraphQLString }
  }
})
const goleType = new GraphQLObjectType({
  name: 'Gole',
  fields: {
    TEAM_MONTHTOTAL: { type: GraphQLInt },
    TEAM_MONTHDONE: { type: GraphQLInt },
    TEAM_DAYTOTAL: { type: GraphQLInt },
    TEAM_DAYDONE: { type: GraphQLInt },
    TEAM_WEEKTOTAL: { type: GraphQLInt },
    TEAM_WEEKDONE: { type: GraphQLInt },
    ME_MONTHTOTAL: { type: GraphQLInt },
    ME_MONTHDONE: { type: GraphQLInt },
    ME_DAYTOTAL: { type: GraphQLInt },
    ME_DAYDONE: { type: GraphQLInt },
    ME_WEEKTOTAL: { type: GraphQLInt },
    ME_WEEKDONE: { type: GraphQLInt }
  }
})

const taskType = new GraphQLObjectType({
  name: 'Task',
  fields: {
    ID: { type: GraphQLInt },
    UPLOADER: { type: GraphQLString },
    TITLE: { type: GraphQLString },
    CONTENT: { type: GraphQLString },
    UPLOAD_AT: { type: GraphQLString },
    START: { type: GraphQLString },
    END: { type: GraphQLString },
    PROJECTID: { type: GraphQLInt },
    ISDONE: { type: GraphQLBoolean },
    UPLOADERNAME: { type: GraphQLString },
    PROJECT_NAME: { type: GraphQLString },
    WORKERS: {
      type: new GraphQLList(workerType),
      resolve: async ({ ID }, _) => {
        return await getWorkers(ID)
      }
    }
  }
})

const issueType = new GraphQLObjectType({
  name: 'Issue',
  fields: {
    ID: { type: GraphQLInt },
    UPLOADER: { type: GraphQLString },
    TITLE: { type: GraphQLString },
    CONTENT: { type: GraphQLString },
    UPLOAD_AT: { type: GraphQLString },
    REFERENCE: { type: GraphQLString },
    PROJECTID: { type: GraphQLInt },
    TYPE: { type: GraphQLInt },
    PROJECT_NAME: { type: GraphQLString }
  }
})

const memoType = new GraphQLObjectType({
  name: 'Memo',
  fields: {
    ID: { type: GraphQLInt },
    TITLE: { type: GraphQLString },
    WRITER: { type: GraphQLString },
    CONTENT: { type: GraphQLString },
    UPDATED_AT: { type: GraphQLString },
    PROJECTID: { type: GraphQLInt },
  }
})

const memberType = new GraphQLObjectType({
  name: 'Member',
  fields: {
    ID: { type: GraphQLInt },
    MEMBERID: { type: GraphQLString },
    PROFILE_URL: { type: GraphQLString },
    USER_NAME: { type: GraphQLString },
    PROJECTID: { type: GraphQLInt },
    SIGNEDUP_AT: { type: GraphQLString },
    TECHS: {
      type: new GraphQLList(GraphQLString),
      resolve: async ({ MEMBERID }, _) => {
        let tech = []
        const data = JSON.parse(JSON.stringify(await getMemberTech(MEMBERID)))
        Object.values(data).map(value => tech.push(value.TECH_NAME))
        return tech
      }
    },
    STATE: { type: GraphQLInt },
    ROLE: { type: GraphQLString }
  }
})

const memberInputType = new GraphQLInputObjectType({
  name: 'MemberInput',
  fields: () => ({
    MEMBERID: { type: GraphQLString },
    ROLE: { type: GraphQLString }
  })
})


const projectsType = new GraphQLObjectType({
  name: 'Projects',
  fields: {
    ID: { type: GraphQLInt },
    LEADER_ID: { type: GraphQLString },
    CREATE_AT: { type: GraphQLString },
    PROJECT_NAME: { type: GraphQLString },
    FIGMA: { type: GraphQLString },
    WEB: { type: GraphQLString },
    PROFILE: { type: GraphQLString },
    GITHUB: { type: GraphQLString },
    MEMBERS: {
      type: new GraphQLList(memberType),
      resolve: async ({ ID }, _) => {
        return await getMembers(ID)
      }
    },
    TAGS: {
      type: new GraphQLList(GraphQLString),
      resolve: async ({ ID }, _) => {
        let tag = []
        const data = JSON.parse(JSON.stringify(await getTags(ID)))
        Object.values(data).map(value => tag.push(value.TAG))
        return tag
      }
    },
    TECHS: {
      type: new GraphQLList(GraphQLString),
      resolve: async ({ ID }, _) => {
        let tech = []
        const data = JSON.parse(JSON.stringify(await getProjectTechs(ID)))
        Object.values(data).map(value => tech.push(value.TECH_NAME))
        return tech
      }
    }
  }
})

const projectType = new GraphQLObjectType({
  name: 'Project',
  fields: {
    ID: { type: GraphQLInt },
    LEADER_ID: { type: GraphQLString },
    CREATE_AT: { type: GraphQLString },
    PROJECT_NAME: { type: GraphQLString },
    FIGMA: { type: GraphQLString },
    WEB: { type: GraphQLString },
    PROFILE: { type: GraphQLString },
    GITHUB: { type: GraphQLString },
    MEMBERS: {
      type: new GraphQLList(memberType),
      resolve: async ({ ID }, _) => {
        return await getMembers(ID)
      }
    },
    TAGS: {
      type: new GraphQLList(GraphQLString),
      resolve: async ({ ID }, _) => {
        let tag = []
        const data = JSON.parse(JSON.stringify(await getTags(ID)))
        Object.values(data).map(value => tag.push(value.TAG))
        return tag
      }
    },
    TECHS: {
      type: new GraphQLList(GraphQLString),
      resolve: async ({ ID }, _) => {
        let tech = []
        const data = JSON.parse(JSON.stringify(await getProjectTechs(ID)))
        Object.values(data).map(value => tech.push(value.TECH_NAME))
        return tech
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: 'ProjectMutation',
  fields: {
    createProject: {
      type: GraphQLInt,
      args: {
        LEADER_ID: { type: new GraphQLNonNull(GraphQLString) },
        PROJECT_NAME: { type: new GraphQLNonNull(GraphQLString) },
        FIGMA: { type: GraphQLString },
        WEB: { type: GraphQLString },
        PROFILE: { type: GraphQLString },
        GITHUB: { type: GraphQLString },
        MEMBER: { type: new GraphQLList(memberInputType) },
        TAG: { type: new GraphQLList(GraphQLString) },
        TECH: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_, params) => {
        try {
          const { insertId: PROJECTID } = await createProject(params)
          console.log(PROJECTID)
          if (PROJECTID) {
            await addMembers(PROJECTID, JSON.parse(JSON.stringify(params.MEMBER)), params.LEADER_ID)
            if (params?.TAG?.length > 0) {
              await createTag(params.TAG)
              await addProjectTag(PROJECTID, params.TAG)
            }
            if (params?.TECH?.length > 0)
              await addProjectTech(PROJECTID, params.TECH)
            return PROJECTID
          } else
            return null
        } catch (error) {
          console.log(error)
          return null
        }
      }
    },
    addProjectIssue: {
      type: issueType,
      args: {
        TITLE: { type: new GraphQLNonNull(GraphQLString) },
        CONTENT: { type: new GraphQLNonNull(GraphQLString) },
        UPLOADER: { type: new GraphQLNonNull(GraphQLString) },
        REFERENCE: { type: GraphQLString },
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        TYPE: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, params) => {
        const data = await addProjectIssue(params)
        const issue = await getIssue(data.insertId)
        if (issue?.length > 0)
          return issue[0]
        return null
      }
    },
    addTask: {
      type: taskType,
      args: {
        UPLOADER: { type: GraphQLString },
        TITLE: { type: GraphQLString },
        CONTENT: { type: GraphQLString },
        START: { type: GraphQLString },
        END: { type: GraphQLString },
        PROJECTID: { type: GraphQLInt },
        WORKERS: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await addTask(params)
        await addTaskWorker(data.insertId, params.WORKERS)
        const task = await getTask(data.insertId)
        const workers = await getWorkers(data.insertId)
        if (task?.length > 0) {
          task[0].WORKERS = [...workers]
          return task[0]
        }
        return null
      }
    },
    addProjectMemo: {
      type: memoType,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        TITLE: { type: new GraphQLNonNull(GraphQLString) },
        WRITER: { type: new GraphQLNonNull(GraphQLString) },
        CONTENT: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, params) => {
        const data = await addProjectMemo(params)
        const memo = await getMemo(data.insertId)
        if (memo?.length > 0)
          return memo[0]
        return null
      }
    },
    updateProfile: {
      type: GraphQLBoolean,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        PROFILE: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await updateProfile(params)
        if (data) return true
        return false
      }
    },
    editProjectMemo: {
      type: memoType,
      args: {
        MEMOID: { type: new GraphQLNonNull(GraphQLInt) },
        TITLE: { type: new GraphQLNonNull(GraphQLString) },
        WRITER: { type: new GraphQLNonNull(GraphQLString) },
        CONTENT: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, params) => {
        await editProjectMemo(params)
        const memo = await getMemo(params.MEMOID)
        if (memo?.length > 0)
          return memo[0]
        return null
      }
    },
    requestProject: {
      type: GraphQLString,
      args: {
        MEMBERID: { type: new GraphQLNonNull(GraphQLString) },
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        ROLE: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await requestProject(params)
        const leaderID = await getLeaderID(params.PROJECTID)
        if (data) return leaderID[0].LEADER_ID
        return null
      }
    },
    updateMember: {
      type: projectType,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        MEMBERID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { ID, MEMBERID}) => {
        await acceptMember(ID, MEMBERID)
        const data = await getProject(ID)
        return data[0]
      }
    },
    chageLeader: {
      type: GraphQLBoolean,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        LEADER_ID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await changeLeader(params)
        if (data) return true
        return false
      }
    },
    editTask: {
      type: GraphQLBoolean,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        TITLE: { type: GraphQLString },
        CONTENT: { type: GraphQLString },
        START: { type: GraphQLString },
        END: { type: GraphQLString },
        WORKERS: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await editTask(params)
        await removeTaskWorker(params.ID)
        await addTaskWorker(params.ID, params.WORKERS)
        if (data) return true
        return false
      }
    },
    editProject: {
      type: GraphQLBoolean,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        PROJECT_NAME: { type: new GraphQLNonNull(GraphQLString) },
        FIGMA: { type: GraphQLString },
        WEB: { type: GraphQLString },
        PROFILE: { type: GraphQLString },
        GITHUB: { type: GraphQLString }
      },
      resolve: async (_, params) => {
        const data = await editProject(params)
        if (data) return true
        return false
      }
    },
    editProjectTag: {
      type: GraphQLBoolean,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        TAG: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_, {PROJECTID, TAG}) => {
        await removeProjectTag(PROJECTID)
        await createTag(TAG)
        const data = await addProjectTag(PROJECTID, TAG)
        if (data) return true
        return false
      }
    },
    editProjectMember: {
      type: GraphQLBoolean,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        MEMBERID: { type: GraphQLString },
        ROLE: { type: GraphQLString }
      },
      resolve: async (_, params) => {
        const data = await editProjectMember(params)
        if (data) return true
        return false
      }
    },
    editProjectTech: {
      type: GraphQLBoolean,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        TECH: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_, { PROJECTID, TECH }) => {
        await removeProjectTech(PROJECTID, TECH)
        const data = await addProjectTech(PROJECTID, TECH)
        if (data) return true
        return false
      }
    },
    editIssue: {
      type: GraphQLBoolean,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        TITLE: { type: GraphQLString },
        CONTENT: { type: GraphQLString },
        UPLOADER: { type: GraphQLString },
        REFERENCE: { type: GraphQLString },
        TYPE: { type: GraphQLInt }
      },
      resolve: async (_, params) => {
        const data = await editIssue(params)
        if (data) return true
        return false
      }
    },
    doneTask: {
      type: GraphQLBoolean,
      args: {
        ID: { type: new GraphQLNonNull(GraphQLInt) },
        ISDONE: { type: new GraphQLNonNull(GraphQLBoolean) }
      },
      resolve: async (_, { ID, ISDONE }) => {
        const data = await doneTask(ID, ISDONE)
        if (data) return true
        return false
      }
    },
    removeProjectMemo: {
      type: GraphQLBoolean,
      args: {
        MEMOID: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, { MEMOID }) => {
        const data = await removeProjectMemo(MEMOID)
        if (data) return true
        return false
      }
    },
    removeMemeber: {
      type: GraphQLBoolean,
      args: { ID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { ID }) => {
        const data = await removeMember(ID)
        if (data) return true
        return false
      }
    },
    removeProjectMemeber: {
      type: GraphQLBoolean,
      args: { 
        MEMBERID: { type: new GraphQLNonNull(GraphQLString) }, 
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) }, 
      },
      resolve: async (_, params) => {
        const data = await removeProjectMemeber(params)
        if (data) return true
        return false
      }
    },
    removeIssue: {
      type: GraphQLBoolean,
      args: { ISSUEID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { ISSUEID }) => {
        const data = await removeIssue(ISSUEID)
        if (data) return true
        return false
      }
    },
    removeTask: {
      type: GraphQLBoolean,
      args: { TASKID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { TASKID }) => {
        const data = await removeTask(TASKID)
        if (data) return true
        return false
      }
    },
    leaveProject: {
      type: GraphQLBoolean,
      args: {
        WORKERID: { type: new GraphQLNonNull(GraphQLString) },
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        MEMBERINDEX: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, { WORKERID, PROJECTID, MEMBERINDEX }) => {
        const data = await removeAllTaskWorker(WORKERID, PROJECTID)
        await removeMember(MEMBERINDEX)
        if (data) return true
        return false
      }
    },
    removeProject: {
      type: GraphQLBoolean,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { PROJECTID }) => {
        const data = await removeProject(PROJECTID)
        if (data) return true
        return false
      }
    }
  }
})


const query = new GraphQLObjectType({
  name: 'ProjectQuery',
  fields: {
    projectIssueTask: {
      description: 'Get project issues & tasks',
      type: goleType,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        MONTH: { type: new GraphQLNonNull(GraphQLInt) },
        DAY: { type: new GraphQLNonNull(GraphQLInt) },
        FIRSTDAYOFWEEK: { type: new GraphQLNonNull(GraphQLString) },
        LASTDAYOFWEEK: { type: new GraphQLNonNull(GraphQLString) },
        WORKERID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await getProjectGole(params)
        return data[0]
      }
    },
    projectGole: {
      description: 'Get project gole',
      type: goleType,
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        TODAY: { type: new GraphQLNonNull(GraphQLString) },
        FIRSTDAYOFWEEK: { type: new GraphQLNonNull(GraphQLString) },
        LASTDAYOFWEEK: { type: new GraphQLNonNull(GraphQLString) },
        WORKERID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        const data = await getProjectGole(params)
        return data[0]
      }
    },
    requestCnt: {
      description: 'Get request cnt',
      type: GraphQLInt,
      args: { ID: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { ID }) => {
        const CNT = await getRequestCnt(ID)
        return CNT[0].CNT
      }
    },
    memos: {
      description: 'Get memos',
      type: new GraphQLList(memoType),
      args: { PROJECTID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { PROJECTID }) => {
        return await getMemos(PROJECTID)
      }
    },
    memberRequest: {
      description: 'Get request',
      type: new GraphQLList(memberRequestType),
      args: { ID: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { ID }) => {
        return await getMemberRequest(ID)
      }
    },
    memberInvite: {
      description: 'Get invite',
      type: new GraphQLList(memberRequestType),
      args: { ID: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { ID }) => {
        return await getMemberInvite(ID)
      }
    },
    project: {
      description: 'Get project with user id',
      type: projectType,
      args: { ID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { ID }) => {
        const data = await getProject(ID)
        return data[0]
      }
    },
    projects: {
      description: 'Get projects with project id',
      type: new GraphQLList(projectsType),
      args: { USERID: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_, params) => {
        return await getProjects(params)
      }
    },
    monthTask: {
      description: 'Get project tasks',
      type: new GraphQLList(GraphQLString),
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        MONTH: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, params) => {
        let temp = []
        let dates = await getMonthTask(params)
        dates = JSON.parse(JSON.stringify(dates))
        dates.forEach(date => {
          temp.push(date.DAY)
        })
        return temp
      }
    },
    dayTask: {
      description: 'Get project tasks',
      type: new GraphQLList(taskType),
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        WORKERID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, params) => {
        return await getDayTasks(params)
      }
    },
    tasks: {
      description: 'Get project tasks',
      type: new GraphQLList(taskType),
      args: {
        PROJECTID: { type: new GraphQLNonNull(GraphQLInt) },
        MONTH: { type: new GraphQLNonNull(GraphQLInt) },
        DAY: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, params) => {
        return await getTasks(params)
      }
    },
    issues: {
      description: 'Get project issues',
      type: new GraphQLList(issueType),
      args: { PROJECTID: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { PROJECTID }) => {
        return await getIssues(PROJECTID)
      }
    },
    simpleTasks: {
      description: 'Get project tasks what I have to do for this month for project main page',
      type: new GraphQLList(taskType),
      args: {
        USERID: { type: new GraphQLNonNull(GraphQLString) },
        MONTH: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, { USERID, MONTH }) => {
        return await getSimpleTask(USERID, MONTH)
      }
    },
    simpleIssues: {
      description: 'Get project issues what not done for project main page',
      type: new GraphQLList(issueType),
      args: { USERID: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { USERID }) => {
        return await getSimpleIssues(USERID)
      }
    }
  },
})

const schema = new GraphQLSchema({
  query,
  mutation
})

module.exports = schema