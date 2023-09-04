const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {});

router.get("/", (req, res) => {
  res.send("Get loads!");
});

router.post("/", (req, res) => {
  res.send("loads Created!");
});

router.put("/", (req, res) => {
  res.send("loads Updated!");
});

router.put("/", (req, res) => {
  res.send("loads deleted!");
});
module.exports = router;
