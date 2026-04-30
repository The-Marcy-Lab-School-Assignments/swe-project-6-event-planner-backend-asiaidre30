const pool = require("../db/pool");

const VALID_EVENT_TYPES = [
  "conference",
  "workshop",
  "social",
  "networking",
  "concert",
  "sports",
  "fundraiser",
  "other",
];

// List all events with creator username and RSVP count, sorted by date
const list = async () => {
  const { rows } = await pool.query(`
    SELECT
      e.*,
      u.username,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    JOIN users u ON e.user_id = u.user_id
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    GROUP BY e.event_id, u.username
    ORDER BY e.date ASC
  `);
  return rows;
};

// List events by a specific user (with RSVP count, no username needed but included for consistency)
const listByUser = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      e.*,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    WHERE e.user_id = $1
    GROUP BY e.event_id
    ORDER BY e.date ASC
  `,
    [userId],
  );
  return rows;
};

// Find a single event by ID
const findById = async (eventId) => {
  const { rows } = await pool.query(
    `SELECT * FROM events WHERE event_id = $1`,
    [eventId],
  );
  return rows[0] || null;
};

// Create a new event owned by userId
const create = async (
  { title, description, date, location, event_type, max_capacity },
  userId,
) => {
  const { rows } = await pool.query(
    `
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [
      title,
      description || null,
      date,
      location,
      event_type,
      max_capacity,
      userId,
    ],
  );
  return rows[0];
};

// Update an event (only provided fields)
const update = async (eventId, fields) => {
  const allowed = [
    "title",
    "description",
    "date",
    "location",
    "event_type",
    "max_capacity",
  ];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }

  if (setClauses.length === 0) return findById(eventId);

  values.push(eventId);
  const { rows } = await pool.query(
    `UPDATE events SET ${setClauses.join(", ")} WHERE event_id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] || null;
};

// Delete an event by ID
const deleteEvent = async (eventId) => {
  const { rows } = await pool.query(
    `DELETE FROM events WHERE event_id = $1 RETURNING *`,
    [eventId],
  );
  return rows[0] || null;
};

module.exports = {
  list,
  listByUser,
  findById,
  create,
  update,
  deleteEvent,
  VALID_EVENT_TYPES,
};
