const userModel = require("../models/userModel");

// PATCH /api/users/:user_id — update password
const updateUser = async (req, res, next) => {
  try {
    const targetId = Number(req.params.user_id);

    if (req.session.userId !== targetId) {
      return res
        .status(403)
        .json({ error: "Forbidden: you can only update your own account." });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const user = await userModel.updatePassword(targetId, password);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:user_id — delete account
const deleteUser = async (req, res, next) => {
  try {
    const targetId = Number(req.params.user_id);

    if (req.session.userId !== targetId) {
      return res
        .status(403)
        .json({ error: "Forbidden: you can only delete your own account." });
    }

    const user = await userModel.deleteUser(targetId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.session = null; // log out after deleting account
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateUser, deleteUser };
