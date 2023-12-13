/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import pkg from 'pg';

const { Pool } = pkg;

export default class Pg {
  /**
   * @type {string}
   */
  name = 'pg';

  /**
   * @type {Application}
   */
  app;

  /**
   * @type {object}
   */
  config;

  /**
   * @type {string}
   */
  defaultHost = 'localhost';

  /**
   * @type {number}
   */
  defaultPort = 5432;

  /**
   * @type {string}
   */
  defaultUser;

  /**
   * @type {string}
   */
  defaultPassword;

  /**
   * @type {number}
   */
  defaultPoolSize = 5;

  /**
   * @type {number}
   */
  defaultConnectionTimeout = 10000;

  /**
   * @type {number}
   */
  defaultIdleTimeout = 10000;

  /**
   * @type {Object.<string, Pool>}
   */
  pools = {};

  constructor(app) {
    this.app = app;
  }

  async start() {
    this.config = this.app.config.pg || null;

    if (!this.config) {
      this.app.logger.info('Нет конфигурации для pg. Инициализация компонента пропущена');
      return;
    }

    if ('host' in this.config) {
      this.defaultHost = this.config.host;
    }

    if ('port' in this.config) {
      this.defaultPort = this.config.port;
    }

    if ('user' in this.config) {
      this.defaultUser = this.config.user;
    }

    if ('password' in this.config) {
      this.defaultPassword = this.config.password;
    }

    if ('poolSize' in this.config) {
      this.defaultPoolSize = this.config.poolSize;
    }

    if ('connectionTimeout' in this.config) {
      this.defaultConnectionTimeout = this.config.connectionTimeout;
    }

    if ('idleTimeout' in this.config) {
      this.defaultIdleTimeout = this.config.idleTimeout;
    }

    if ('database' in this.config) {
      this.pools.default = this.#getPool({ database: this.config.database });
      await this.#connect(this.pools.default, this.config.database);
    } else {
      await Promise.all(Object.keys(this.config).map(async (key) => {
        if (this.config[key] && typeof this.config[key] === 'object' && 'database' in this.config[key]) {
          this.pools[key] = this.#getPool(this.config[key]);
          await this.#connect(this.pools[key], this.config[key].database);
        }
      }));
    }
    this.app.pg = this.pools.default ?? this.pools;
  }

  #getPool(config) {
    const {
      host,
      port,
      user,
      password,
      database,
      poolSize,
      connectionTimeout,
      idleTimeout,
    } = config;

    return new Pool({
      host: host || this.defaultHost,
      port: port || this.defaultPort,
      user: user || this.defaultUser,
      password: password || this.defaultPassword,
      database,
      max: poolSize || this.defaultPoolSize,
      connectionTimeoutMillis: connectionTimeout || this.defaultConnectionTimeout,
      idleTimeoutMillis: idleTimeout || this.defaultIdleTimeout,
    });
  }

  async #connect(pool, database) {
    try {
      const client = await pool.connect();
      pool.tables = rows.map((record) => (`${record.schemaname}.${record.tablename}`));
      await client.release();
      this.app.logger.debug(`База данных ${database} подключена`);
    } catch (error) {
      this.app.logger.error(`Не удалось подключиться к базе данных ${database}`);
      throw error;
    }
  }

  async stop() {
    await Promise.all(Object.values(this.pools).map(async (pool) => {
      await pool.end();
    }));
  }
}
