const pool = require("./pool");
require("dotenv").config();

const seed = async () => {
  try {
    // Drop tables in reverse dependency order
    await pool.query(`DROP TABLE IF EXISTS rsvps CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS events CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);

    // Create users
    await pool.query(`
      CREATE TABLE users (
        user_id   SERIAL PRIMARY KEY,
        username  TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);

    // Create events
    await pool.query(`
      CREATE TABLE events (
        event_id     SERIAL PRIMARY KEY,
        title        TEXT NOT NULL,
        description  TEXT,
        date         TEXT NOT NULL,
        location     TEXT NOT NULL,
        event_type   TEXT NOT NULL,
        max_capacity INTEGER NOT NULL,
        user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    // Create rsvps
    await pool.query(`
      CREATE TABLE rsvps (
        rsvp_id  SERIAL PRIMARY KEY,
        user_id  INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        UNIQUE (user_id, event_id)
      );
    `);

    // Seed users (bcrypt hash of "password123")
    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash("password123", 10);

    const userResult = await pool.query(
      `
      INSERT INTO users (username, password_hash) VALUES
        ('alice', $1),
        ('bob',   $1),
        ('carol', $1)
      RETURNING user_id, username;
    `,
      [hash],
    );

    const [alice, bob, carol] = userResult.rows;

    // Seed events
    const eventResult = await pool.query(
      `
      INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES
        ('React & Node Workshop',  'Hands-on fullstack workshop',   '2025-06-01', 'New York, NY',      'workshop',    30, $1),
        ('Tech Networking Mixer',  'Meet local developers',         '2025-07-10', 'Brooklyn, NY',      'networking',  50, $1),
        ('Summer Music Concert',   'Live outdoor music event',      '2025-07-20', 'Central Park, NY',  'concert',    200, $2),
        ('Charity 5K Fundraiser',  'Run to raise money for kids',   '2025-08-05', 'Hoboken, NJ',       'fundraiser',  80, $2),
        ('Morning Yoga Social',    'Relaxing group yoga session',   '2025-08-15', 'Prospect Park, NY', 'social',      25, $3),
        ('Cloud Computing Conf',   'Industry conference on cloud',  '2025-09-01', 'Manhattan, NY',     'conference', 300, $3)
      RETURNING event_id;
    `,
      [alice.user_id, bob.user_id, carol.user_id],
    );

    const eventIds = eventResult.rows.map((r) => r.event_id);

    // Seed RSVPs
    await pool.query(
      `
      INSERT INTO rsvps (user_id, event_id) VALUES
        ($1, $4),
        ($1, $5),
        ($2, $6),
        ($3, $4),
        ($3, $5)
    `,
      [
        alice.user_id,
        bob.user_id,
        carol.user_id,
        eventIds[0],
        eventIds[1],
        eventIds[2],
      ],
    );

    console.log("Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(" Seed error:", err);
    process.exit(1);
  }
};

seed();
