const {sequelize, User, Vote, Option, UserVoting} = require('../data/db-init')

User.create({
  name: 'kiki2',
  email: 'q@qq.com',
  password: '23',
  gender: 'f'
})

User.create({
  name: 'kiki44',
  email: 'q@qq.com',
  password: '23',
  gender: 'f'
})
