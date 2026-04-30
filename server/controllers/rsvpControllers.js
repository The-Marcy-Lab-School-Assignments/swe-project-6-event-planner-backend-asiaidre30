const rsvpModel = require("../models/rsvpModel");

// POST /api/events/:event_id/rsvps
const createRsvp = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const rsvp = await rsvpModel.create(req.session.userId, eventId);
    res.status(201).json(rsvp); // null if already existed — that's fine per spec
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:event_id/rsvps
const deleteRsvp = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const rsvp = await rsvpModel.deleteRsvp(req.session.userId, eventId);
    res.json(rsvp); // null if it didn't exist — that's fine per spec
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/rsvps
const listRsvpsByUser = async (req, res, next) => {
  try {
    const events = await rsvpModel.listEventsByUser(Number(req.params.user_id));
    res.json(events);
  } catch (err) {
    next(err);
  }
};

module.exports = { createRsvp, deleteRsvp, listRsvpsByUser };
