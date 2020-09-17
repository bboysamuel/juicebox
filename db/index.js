

const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username 
      FROM users;
    `);
  
    return rows;
  }

module.exports = {
  client,
  getAllUsers,
  createUser,

}

// async function createUser({ username, password }) {
//     try {
//         const result = await client.query(`
//         INSERT INTO users(username, password)
//         VALUES ($1, $2);
//       `, [username, password]);
  
//       return result
//     } catch (error) {
//       throw error;
//     }
//   }

  // later
//     module.exports = {
//         client,
//         getAllUsers,
//         createUser,
//     // add createUser here!
//   }

  client.query(`
  INSERT INTO users(username, password) VALUES ($1, $2);
`, [ "some_name", "some_password" ]);

async function createUser({ username, password }) {
  try {
    const result = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password]);

    return result;
  } catch (error) {
    throw error;
  }
}



// // later
// module.exports = {
//   // add createUser here!
// }