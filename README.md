# maru-pg

Компонент, отвечающий за работу с базами данных PosgreSQL.

## Как добавить

Установка

```sh
npm install --save github:ccet-projects/maru-pg
```

Точка входа в приложение

```js
import maru from 'maru';
import pg from '@maru/pg';

const app = maru(import.meta.url, [pg]);
app.start();
```

Используемые ключи конфига

| Название | Обязательно | Значение по умолчанию | Описание |
| --- | --- | --- | --- |
| host | Нет | 'localhost' | Хост сервера базы данных |
| port | Нет | 5432 | Порт сервера базы данных |
| user | Нет |  | Пользователь базы данных |
| password | Нет |  | Пароль пользователя базы данных |
| database | Да |  | Название базы данных |
| defaultPoolSize | Нет | 5 | Размер пула  |
| defaultConnectionTimeout | Нет | 10000 | Время ожидания подключения |
| defaultIdleTimeout | Нет | 10000 | Время бездействия клиента |

Если требуется подключение только к одной базе данных, ключи конфигурации можно указать в корневом уровне конфига.

Пример файла конфигурации

```js
{
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'password',
    database: 'dbname'
}
```

В таком случае база данных будет доступна через объект ```app.pg ```

Если требуется подключение к нескольким базам, ключи можно перечислить на втором уровне конфига - внутри кастомного ключа. Название кастомного ключа при этом будет названием подключения, а подключение будет доступно через объект ```app.pg.connectionName ```

Пример файла конфигурации для подключения к нескольким базам данных

```js
{
    connection1: {
        host: 'localhost',
        port: 5432,
        user: 'user1',
        password: 'password1',
        database: 'dbname1'
    },
    connection2: {
        host: 'localhost',
        port: 5432,
        user: 'user2',
        password: 'password2',
        database: 'dbname2'
    },
}
```

Если в конфигурации указано несколько подключений, но при этом на корневом уровне присутствуют стандартные ключи, их значения будут использованы как значения по умолчанию. При этом, если на корневом уровне указан ключ ```database```, кастомные ключи будут игнорироваться и будет подключена только одна база данных, данные которой указаны на корневом уровне.

Для работы с базами данных компонент использует node-postgres. См. https://node-postgres.com/