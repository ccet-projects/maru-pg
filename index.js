import pg from 'pg';

const DEFAULTS = {
  host: 'localhost',
  port: 5432,
  user: '',
  password: '',
  database: '',
  connectionsize: 5,
  connectionTimeout: 10000,
  idleTimeout: 10000,
};

const KEYS = new Set(Object.keys(DEFAULTS));

export default class Pg {
  /**
   * @type {Application}
   */
  app;

  /**
   * @type {Object}
   */
  defaults = DEFAULTS;

  /**
   * @type {Object<string, pg.Pool>}
   */
  connections = {};

  constructor(app) {
    this.app = app;
  }

  async start() {
    const config = this.app.config.pg;

    if (!config) {
      throw new Error('Нет задан конфиг для PostgreSQL');
    }

    const dbs = [];

    Object.keys(config).forEach((key) => {
      if (KEYS.has(key)) {
        this.defaults[key] = config[key];
      } else if (config[key].database) {
        dbs.push(key);
      } else {
        this.app.logger.warn(`Лишний ключ ${key} в конфиге базы данных PostgreSQL`);
      }
    });

    if (!dbs.length && !config.database) {
      throw new Error('Не задано имя базы данных PostgreSQL');
    }

    if (dbs.length > 0) {
      const entries = await Promise.all(
        dbs.map(
          (key) => this.#connect(config[key]).then((connection) => [key, connection])
        )
      );
      this.connections = Object.fromEntries(entries);
      this.app.pg = this.connections;
    } else {
      this.connections.default = await this.#connect(config);
      this.app.pg = this.connections.default;
    }
  }

  async stop() {
    this.app.pg = null;
    const connections = Object.values(this.connections);
    return Promise.all(connections.map((c) => c.end()));
  }

  async #connect(config) {
    const pool = new pg.Pool({ ...this.defaults, ...config });
    const client = await pool.connect();
    await client.release();
    this.app.logger.debug(`База данных ${config.database} подключена`);
    return pool;
  }
}
