import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';

// eslint-disable-next-line import/no-extraneous-dependencies
import maru from 'maru';
// eslint-disable-next-line import/no-relative-packages
import pg from '../index.js';

describe('Запуск', () => {
  let app;

  after(() => app?.stop());

  it('Обычное подключение компонента', async () => {
    app = maru(import.meta.url, [pg], {
      pg: {
        user: 'postgres',
        password: 'qwerty',
        database: 'maru'
      }
    });
    await app.start();
    assert.ok(app.pg);
    await app.stop();
    app = null;
  });

  it('Подключение нескольких баз данных одновременно', async () => {
    app = maru(import.meta.url, [pg], {
      pg: {
        user: 'postgres',
        password: 'qwerty',
        a: { database: 'maru' },
        b: { database: 'maru' }
      }
    });
    await app.start();
    assert.ok(app.pg.a);
    assert.ok(app.pg.b);
    assert.notEqual(app.pg.a, app.pg.b);
    await app.stop();
    app = null;
  });
});
