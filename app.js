const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/equipment-hours', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM equipment_hours ORDER BY entry_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/equipment-hours', async (req, res) => {
  try {
    const { equipment_tag, entry_date, total_counter_hours, meter_hours, entered_by, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO equipment_hours (equipment_tag, entry_date, total_counter_hours, meter_hours, entered_by, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [equipment_tag, entry_date, total_counter_hours, meter_hours, entered_by, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
