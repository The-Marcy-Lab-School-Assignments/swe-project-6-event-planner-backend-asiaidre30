const pool = require("../db/pool");

// Create an RSVP (silently ignore duplicates)
const create = async (userId, eventId) => {
  const { rows } = await pool.query(
    `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, event_id) DO NOTHING
    RETURNING *
  `,
    [userId, eventId],
  );
  return rows[0] || null; // null if already existed
};

// Delete an RSVP for a user+event pair
const deleteRsvp = async (userId, eventId) => {
  const { rows } = await pool.query(
    `
    DELETE FROM rsvps WHERE user_id = $1 AND event_id = $2
    RETURNING *
  `,
    [userId, eventId],
  );
  return rows[0] || null; // null if it didn't exist
};

// Get all full event objects for a user's RSVPs
const listEventsByUser = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      e.*,
      u.username,
      COUNT(r2.rsvp_id) AS rsvp_count
    FROM rsvps r
    JOIN events e ON r.event_id = e.event_id
    JOIN users u ON e.user_id = u.user_id
    LEFT JOIN rsvps r2 ON e.event_id = r2.event_id
    WHERE r.user_id = $1
    GROUP BY e.event_id, u.username
    ORDER BY e.date ASC
  `,
    [userId],
  );
  return rows;
};

module.exports = { create, deleteRsvp, listEventsByUser };
