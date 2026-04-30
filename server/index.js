// loads all the env variables from .env file gotta do this first
require("dotenv").config();
const express = require("express");
const cookieSession = require("cookie-session"); // handles the session cookie stuff
const path = require("path");

// bringing in middleware
const logRoutes = require("./middleware/logRoutes");
const checkAuthentication = require("./middleware/checkAuthentication"); // blocks non logged in users

// bringing in all the controllers (these handle what happens at each route)
const authControllers = require("./controllers/authControllers");
const userControllers = require("./controllers/userControllers");
const eventControllers = require("./controllers/eventControllers");
const rsvpControllers = require("./controllers/rsvpControllers");

const app = express();
const PORT = process.env.PORT || 8080; // use .env port or default to 8080

// middleware that runs on every request
app.use(express.json()); // lets us read req.body as json
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "default_secret"], // secret key to sign the cookie
    maxAge: 24 * 60 * 60 * 1000, // cookie expires after 24 hours
  }),
);
app.use(logRoutes); // logs every request to the terminal

// auth routes - no login required for these obviously
app.post("/api/auth/register", authControllers.register);
app.post("/api/auth/login", authControllers.login);
app.get("/api/auth/me", authControllers.me); // checks whos logged in
app.delete("/api/auth/logout", authControllers.logout);

// user routes - gotta be logged in + can only touch ur own account
app.patch(
  "/api/users/:user_id",
  checkAuthentication,
  userControllers.updateUser,
);
app.delete(
  "/api/users/:user_id",
  checkAuthentication,
  userControllers.deleteUser,
);

// event routes - GET is public, everything else needs auth
app.get("/api/events", eventControllers.listEvents); // anyone can see events
app.post("/api/events", checkAuthentication, eventControllers.createEvent);
app.patch(
  "/api/events/:event_id",
  checkAuthentication,
  eventControllers.updateEvent,
);
app.delete(
  "/api/events/:event_id",
  checkAuthentication,
  eventControllers.deleteEvent,
);
app.get("/api/users/:user_id/events", eventControllers.listEventsByUser); // public too

// rsvp routes - need to be logged in to rsvp
app.post(
  "/api/events/:event_id/rsvps",
  checkAuthentication,
  rsvpControllers.createRsvp,
);
app.delete(
  "/api/events/:event_id/rsvps",
  checkAuthentication,
  rsvpControllers.deleteRsvp,
);
app.get("/api/users/:user_id/rsvps", rsvpControllers.listRsvpsByUser); // public

// catches any random errors so the server doesnt crash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

// starts the server!!
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
