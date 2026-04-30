const pool = require("../db/pool");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

//creating a new user with a hashed password
const create = async (username, password) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash)
    VALUES ($1, $2)
    RETURNING user_id, username `,
    [username, passwordHash],
  );
  return rows[0];
};

//finding a user by username (including the password_hash for login verifacation)

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    `SELECT user_id, username, password_hash FROM users WHERE username = $1`,
    [username],
  );
  return rows[0] || null;
};

// finding a user by ID (safe no password hash)

const findById = async (userId) => {
  const { rows } = await pool.query(
    `SELECT user_id, username FROM users WHERE user_id = $1`,
    [userId],
  );
  return rows[0] || null;
};

// updating a users password

const updatePassword = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { rows } = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE user_id = $2
    RETURNING user_id, username`,
    [passwordHash, userId],
  );
  return rows[0] || null;
};

// delete a user by ID
const deleteUser = async (userId) => {
  const { rows } = await pool.query(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id, username`,
    [userId],
  );
  return rows[0] || null;
};

module.exports = {
  create,
  findByUsername,
  findById,
  updatePassword,
  deleteUser,
};
