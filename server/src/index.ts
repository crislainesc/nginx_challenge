import express from 'express';
import mysql from 'mysql';
import { faker } from '@faker-js/faker';
import { promisify } from 'util';

const config = {
  server: { port: process.env.PORT },
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

const server = express();
const defaultStyle = '"margin: 1rem;"';

server.get('/', async (req, res) => {
  try {
    const databaseConnection = mysql.createConnection(config.database);

    const newPerson = req.query?.name ?? faker.person.fullName();
    console.log({ newPerson });

    const insertPeopleQuery = `INSERT INTO people(name) VALUES ('${newPerson}')`;
    databaseConnection.query(insertPeopleQuery);

    const getQuery = `SELECT * FROM people`;

    const queryPromise = promisify(databaseConnection.query).bind(
      databaseConnection
    );
    const people: Array<{name:string}> = await queryPromise(getQuery) as Array<{name:string}>;

    databaseConnection.end();

    const peopleTags = people.map(
      (person) => `<li style=${defaultStyle}>${person.name}</li>`
    );

    res.send(
      `
      <h1 style=${defaultStyle}>Full Cycle Rocks!</h1>
      <ul>${peopleTags.join('')}</ul>
    `
    );
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error)}`);
    res
      .status(500)
      .send(`<h1 style=${defaultStyle}>Internal server error!</h1>`);
  }
});

server.listen(config.server.port, () => {
  console.log(`🚀 Running on port: ${config.server.port}`);
});
