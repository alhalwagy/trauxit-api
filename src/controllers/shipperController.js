const Shipper = require('../models/shipper');

// Controller functions

// Add a new shipper
const addShipper = async (req, res) => {
  try {
    const newShipper = new Shipper(req.body);
    await newShipper.save();
    res.status(201).json({ message: 'Shipper added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding shipper' });
  }
};

// Remove a shipper by ID
const removeShipper = async (req, res) => {
  try {
    await Shipper.deleteOne({ id: req.params.id });
    res.json({ message: 'Shipper removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing shipper' });
  }
};

// Edit a shipper by ID
const editShipper = async (req, res) => {
  try {
    const shipper = await Shipper.findOne({ id: req.params.id });
    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found' });
    }
    res.json(shipper);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving shipper for editing' });
  }
};

// Update a shipper by ID
const updateShipper = async (req, res) => {
  try {
    await Shipper.updateOne({ id: req.params.id }, req.body);
    res.json({ message: 'Shipper updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating shipper' });
  }
};

module.exports = {
  addShipper,
  removeShipper,
  editShipper,
  updateShipper,
};
