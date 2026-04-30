require("dotenv").config();
const { Pool } = require("pg");
const config = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
};
const prodConfig = {
  connectionString: process.env.PG_CONNECTION_STRING,
};
