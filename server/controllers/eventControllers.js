const eventModel = require("../models/eventModel");

// GET /api/events
const listEvents = async (req, res, next) => {
  try {
    const events = await eventModel.list();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/events
const listEventsByUser = async (req, res, next) => {
  try {
    const events = await eventModel.listByUser(Number(req.params.user_id));
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, event_type, max_capacity } =
      req.body;

    if (!title || !date || !location || !event_type || !max_capacity) {
      return res
        .status(400)
        .json({
          error:
            "title, date, location, event_type, and max_capacity are required.",
        });
    }

    if (!eventModel.VALID_EVENT_TYPES.includes(event_type)) {
      return res
        .status(400)
        .json({
          error: `Invalid event_type. Must be one of: ${eventModel.VALID_EVENT_TYPES.join(", ")}`,
        });
    }

    const event = await eventModel.create(
      { title, description, date, location, event_type, max_capacity },
      req.session.userId,
    );
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/events/:event_id
const updateEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const existing = await eventModel.findById(eventId);

    if (!existing) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (existing.user_id !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: you can only edit your own events." });
    }

    if (
      req.body.event_type &&
      !eventModel.VALID_EVENT_TYPES.includes(req.body.event_type)
    ) {
      return res
        .status(400)
        .json({
          error: `Invalid event_type. Must be one of: ${eventModel.VALID_EVENT_TYPES.join(", ")}`,
        });
    }

    const updated = await eventModel.update(eventId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:event_id
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const existing = await eventModel.findById(eventId);

    if (!existing) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (existing.user_id !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: you can only delete your own events." });
    }

    const deleted = await eventModel.deleteEvent(eventId);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listEvents,
  listEventsByUser,
  createEvent,
  updateEvent,
  deleteEvent,
};
