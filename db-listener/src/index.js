const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function listen() {
  await client.connect();

  await client.query('LISTEN producto_insertado');

  client.on('notification', async (msg) => {
    const data = JSON.parse(msg.payload);

    console.log(data);
  });
}

listen();
