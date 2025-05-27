import express from 'express';
import Warehouse from '../models/warehouse.model.js';

const router = express.Router();

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new warehouse
router.post('/', async (req, res) => {
  const warehouse = new Warehouse(req.body);
  try {
    const newWarehouse = await warehouse.save();
    res.status(201).json(newWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update warehouse
router.put('/:id', async (req, res) => {
  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete warehouse
router.delete('/:id', async (req, res) => {
  try {
    await Warehouse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;