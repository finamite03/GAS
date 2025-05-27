import express from 'express';
import SKU from '../models/sku.model.js';

const router = express.Router();

// Get all SKUs
router.get('/', async (req, res) => {
  try {
    const skus = await SKU.find();
    res.json(skus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new SKU
router.post('/', async (req, res) => {
  const sku = new SKU(req.body);
  try {
    const newSKU = await sku.save();
    res.status(201).json(newSKU);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update SKU
router.put('/:id', async (req, res) => {
  try {
    const updatedSKU = await SKU.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSKU);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete SKU
router.delete('/:id', async (req, res) => {
  try {
    await SKU.findByIdAndDelete(req.params.id);
    res.json({ message: 'SKU deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;