exports.USER_INFO = (sequelize, DataTypes) =>
  sequelize.define('USER_INFO', {
    ID: {
      type: DataTypes.STRING(70),
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    EMAIL: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    LAST_LOGIN_TIME: {
      type: DataTypes.STRING(50)
    },
    COUNTRY: {
      type: DataTypes.STRING(50)
    },
    USER_NAME: {
      type: DataTypes.STRING(50)
    },
    PROFILE_URL: {
      type: DataTypes.STRING(200)
    },
    JOB: {
      type: DataTypes.STRING(50)
    },
    DEV_POSITION: {
      type: DataTypes.STRING(50)
    },
    GITHUB: {
      type: DataTypes.STRING(50)
    },
    WEBPAGE: {
      type: DataTypes.STRING(500)
    },
    ACCESSED_IP: {
      type: DataTypes.STRING(50)
    },
    ACCESSED_COUNTRY: {
      type: DataTypes.STRING(50)
    },
    ACCESSED_CITY: {
      type: DataTypes.STRING(200)
    },
    EXPO_PUSH_TOKEN: {
      type: DataTypes.STRING(100)
    },
    DEVICE: {
      type: DataTypes.STRING(50)
    },
    OS: {
      type: DataTypes.STRING(50)
    },
    OS_VERSION: {
      type: DataTypes.STRING(50)
    },
    GENDER: {
      type: DataTypes.INTEGER
    },
    BIRTH: {
      type: DataTypes.INTEGER
    },
    EXPERIENCE: {
      type: DataTypes.INTEGER
    },
    ALLOW_EMAIL: {
      type: DataTypes.BOOLEAN
    },
    ALLOW_CHAT: {
      type: DataTypes.BOOLEAN
    }
  })
  
exports.REQUEST = (sequelize, DataTypes) =>
  sequelize.define('REQUEST', {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    SENDID: {
      type: DataTypes.STRING(70),
      reference: {
        model: 'USER_INFO',
        key: 'ID'
      }
    },
    SENT_AT: {
      type: DataTypes.STRING(20)
    },
    REQUEST_TYPE: {
      type: DataTypes.INTEGER
    },
    RECEIVERID: {
      type: DataTypes.STRING(70),
      reference: {
        model: 'USER_INFO',
        key: 'ID'
      }
    },
    INFO: {
      type: DataTypes.STRING(100)
    }
  })