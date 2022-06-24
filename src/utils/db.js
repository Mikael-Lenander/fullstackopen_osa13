const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')
const { Umzug, SequelizeStorage } = require('umzug')

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('database connected')
  } catch (err) {
    console.log('connecting database failed: ', err)
    return process.exit(1)
  }

  return null
}

const migrationConf = file => ({
  migrations: {
    glob: `migrations/${file}`,
  },
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  context: sequelize.getQueryInterface(),
  logger: console,
})

const runMigrations = async () => {
  await sequelize.authenticate()
  const migrator = new Umzug(migrationConf('*.js'))
  const migrations = await migrator.up()
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  })
}
const rollbackMigration = async (file) => {
  await sequelize.authenticate()
  const migrator = new Umzug(migrationConf(file))
  await migrator.down()
}

module.exports = { connectToDatabase, sequelize, rollbackMigration, runMigrations }