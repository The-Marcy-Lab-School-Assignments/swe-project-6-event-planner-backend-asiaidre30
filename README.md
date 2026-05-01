require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieSession = require("cookie-session");

const logRoutes = require("./middleware/logRoutes");
const checkAuthentication = require("./middleware/checkAuthentication");

const {
register,
login,
me,
logout,
} = require("./controllers/authControllers");

const { updateUser, deleteUser } = require("./controllers/userControllers");

const {
listEvents,
listEventsByUser,
createEvent,
updateEvent,
deleteEvent,
} = require("./controllers/eventControllers");

const {
listRsvpsByUser,
createRsvp,
deleteRsvp,
} = require("./controllers/rsvpControllers");

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ FIXED FRONTEND PATH (absolute, reliable)
const pathToFrontend = path.join(\_\_dirname, "../frontend/dist");

// ====================================
// Middleware
// ====================================

app.use(logRoutes);

app.use(
cookieSession({
name: "session",
keys: [process.env.SESSION_SECRET || "default_secret"],
maxAge: 24 _ 60 _ 60 \* 1000,
})
);

app.use(express.json());

// ✅ serve frontend build
app.use(express.static(pathToFrontend));

// ====================================
// Auth routes
// ====================================

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", me);
app.delete("/api/auth/logout", logout);

// ====================================
// User routes
// ====================================

app.patch("/api/users/:user_id", checkAuthentication, updateUser);
app.delete("/api/users/:user_id", checkAuthentication, deleteUser);

// ====================================
// Event routes
// ====================================

app.get("/api/events", listEvents);
app.get("/api/users/:user_id/events", listEventsByUser);

app.post("/api/events", checkAuthentication, createEvent);
app.patch("/api/events/:event_id", checkAuthentication, updateEvent);
app.delete("/api/events/:event_id", checkAuthentication, deleteEvent);

// ====================================
// RSVP routes
// ====================================

app.get("/api/users/:user_id/rsvps", listRsvpsByUser);

app.post("/api/events/:event_id/rsvps", checkAuthentication, createRsvp);
app.delete("/api/events/:event_id/rsvps", checkAuthentication, deleteRsvp);

// ====================================
// FRONTEND ROUTE FIX (IMPORTANT)
// ====================================

// MUST be AFTER API routes
app.get("\*", (req, res) => {
res.sendFile(path.join(pathToFrontend, "index.html"));
});

// ====================================
// Error handler
// ====================================

app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ message: "Internal Server Error" });
});

// ====================================
// Start server
// ====================================

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});
