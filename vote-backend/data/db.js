const { Model, Sequelize, DataTypes } = require('sequelize')
const path = require('path')

/* 如下为了node --inspect-brk 用*/
var __dirname = __dirname ?? '.' ; var exports = exports ?? {}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false, /* 去掉控制台输出 */
})

class User extends Model { }
class Vote extends Model { }
class Option extends Model {}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {notEmpty: true} /* 此可省略，前端如注册页面 相关条目required即可 */
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {notEmpty: true}
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {notEmpty: true}
  },
  salt: {/* 后期刷表加盐， 前期密码就明文显示 */
    type: DataTypes.STRING
  },
  gender: {
    type: DataTypes.ENUM('m', 'f'),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '/uploads/default.png'
  }
}, {
  sequelize,
  modelName: 'user' /* 会自动表示为复数形式 */
})

/* --------------投票相关---------------- */
Vote.init({
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  deadline: DataTypes.DATE,
  multiSelect: {type: DataTypes.BOOLEAN, defaultValue: false},
  anonymous: {type: DataTypes.BOOLEAN, defaultValue: false},
  restricted: {type: DataTypes.BOOLEAN, defaultValue: false},
}, { sequelize, modelName: 'vote' })

User.hasMany(Vote)
Vote.belongsTo(User)

/* --------------投票选项相关（单独成个表）(如果使用 在vote下包含option（s） 信息，造成表的安排混乱)---------------- */

Option.init({
  content: DataTypes.STRING,
  count: DataTypes.INTEGER,
}, { 
  sequelize, 
  modelName: 'option',
  timestamps: false,
})

Vote.hasMany(Option)
Option.belongsTo(Vote)

/* 投票细节[多对多的映射关系(对等映射，而非从属关系)]： 不仅记录了一个投票的一个选项被投多少次，以及被谁投过， 所以还需个关联 userId 和optionId 的数据表 */
/* 如下的会形成一份 userId 和 optionId 的映射表 */
const UserVoting = sequelize.define('user_vote', null,{
  timestamps: false, 
})
User.belongsToMany(Option, {through: UserVoting,})
Option.belongsToMany(User, {through: UserVoting})


  ; (async () => {
    await sequelize.sync(/* {force: true} */) // 也可使用 #sync({force: true}) (不过只建议开发模式下使用)
    console.log('【sync now】');

  })()

  // 导出表
  module.exports = {
    sequelize,
    User,
    Option,
    Vote,
    UserVoting,
  }
