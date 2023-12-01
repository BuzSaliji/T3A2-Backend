const express = require('express');
const { Court } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const courts = await Court.findAll();
  res.json(courts);
});

router.get('/:id', async (req, res) => {
  const court = await Court.findByPk(req.params.id);
  res.json(court);
});

router.post('/', async (req, res) => {
  const court = await Court.create(req.body);
  res.json(court);
});

router.patch('/:id', async (req, res) => {
  const court = await Court.findByPk(req.params.id);
  await court.update(req.body);
  res.json(court);
});

router.delete('/:id', async (req, res) => {
  const court = await Court.findByPk(req.params.id);
  await court.destroy();
  res.json({ deleted: true });
});

module.exports = router;