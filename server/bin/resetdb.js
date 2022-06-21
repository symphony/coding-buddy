require("dotenv").config();

const fs = require("fs");
const { Client } = require("pg");
const dbParams = require("../lib/db");
const db = new Client(dbParams);

const runSchemaFiles = async () => {
  const schemaFilenames = fs.readdirSync("./db/schema");
  for (const fn of schemaFilenames) {
    console.log('seeding..', fn)
    const sql = fs.readFileSync(`./db/schema/${fn}`, "utf8");
    await db.query(sql);
  }
};

// not needed. seed files in schema
// const runSeedFiles = async () => {
//   const schemaFilenames = fs.readdirSync("../db/seeds");

//   for (const fn of schemaFilenames) {
//     const sql = fs.readFileSync(`../db/seeds/${fn}`, "utf8");
//     await db.query(sql);
//   }
// };

const runResetDB = async () => {
  try {
    dbParams.host && console.log("Connecting to PG..host");
    dbParams.connectionString && console.log("Connecting to PG");
    await db.connect();
    await runSchemaFiles();
    // await runSeedFiles();
    console.log('done')
    db.end;
    process.exit();
  } catch (err) {
    console.log("ERROR", err);
    db.end;
  }
};

runResetDB();