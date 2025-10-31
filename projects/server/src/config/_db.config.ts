import { registerAs } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

export default registerAs('db', () => {
  const {
    DB_HOST, DB_PORT, DB_USER, DB_PSWD,
    DB_NAME, DB_CONNECT_TIMEOUT,
    DB_CONN_LIMIT,
  } = process.env

  return <TypeOrmModuleOptions>{
    type: 'postgres',
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT||'5432'),
    username: DB_USER,
    password: DB_PSWD,
    database: DB_NAME,
    connectTimeout: parseInt(DB_CONNECT_TIMEOUT || '60000'),
    extra: {
      connectionLimit: parseInt(DB_CONN_LIMIT || '100'),
    },
    autoLoadEntities: true,
    synchronize: true,
    legacySpatialSupport: false,
  }
})
