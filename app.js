import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import path from 'path';

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

console.log(process.env.DATABASE_URL)

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the node_modules directory under a specific route
app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/equipment-hours', async (req, res) => {
  try {
    // Modify the query to order by entry_date descending and limit the result to 5
    const { rows } = await pool.query('SELECT * FROM equipment_hours ORDER BY entry_date DESC LIMIT 5');
    res.json(rows);
  } catch (err) {
    console.error('Error querying equipment hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/all-equipment-hours', async (req, res) => {
  try {
    // Modify the query to order by entry_date descending and limit the result to 5
    const { rows } = await pool.query('SELECT * FROM equipment_hours ORDER BY entry_date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error querying equipment hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//to add new equipment hours
app.post('/api/equipment-hours', async (req, res) => {
  console.log("received request to add equipment hours");
  const { equipmentTag, entryDate, totalCounterHours, meterHours, enteredBy, notes } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO equipment_hours (equipment_tag, entry_date, total_counter_hours, meter_hours, entered_by, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [equipmentTag, entryDate || 'NOW()', totalCounterHours, meterHours, enteredBy, notes]
    );
    res.status(201).json({ message: 'Equipment hours added successfully', data: result.rows });
  } catch (err) {
    console.error('Error adding equipment hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//to update existing equipment hours
app.post('/api/update-equipment-hours/:id', async (req, res) => {
  const { total_counter_hours, meter_hours, notes, entered_by } = req.body; // Make sure to include all fields you might want to update.

  if (!total_counter_hours || !meter_hours || !entered_by) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      const result = await pool.query(
          'UPDATE equipment_hours SET total_counter_hours = $1, meter_hours = $2, notes = $3, entered_by = $4 WHERE id = $5',
          [total_counter_hours, meter_hours, notes, entered_by, req.params.id]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'No entry found with the given ID' });
      }

      res.json({ message: 'Equipment hours updated successfully' });
  } catch (err) {
      console.error('Error updating equipment hours:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//delete a specific row
app.delete('/api/delete-equipment-hours/:id', async (req, res) => {
  try {
      const result = await pool.query('DELETE FROM equipment_hours WHERE id = $1', [req.params.id]);
      if (result.rowCount > 0) {
          res.json({ message: 'Entry deleted successfully' });
      } else {
          res.status(404).json({ message: 'Entry not found' });
      }
  } catch (err) {
      console.error('Error deleting equipment hours:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});




//to get the hours only for a specific equipment_tag
app.get('/api/equipment-hours/:tag', async (req, res) => {
  const tag = req.params.tag;
  try {
    const { rows } = await pool.query('SELECT * FROM equipment_hours WHERE equipment_tag = $1 ORDER BY entry_date DESC', [tag]);
    res.json(rows);
  } catch (err) {
    console.error('Error querying equipment hours by tag:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//to get the list of equipment_tags
app.get('/api/equipment-tags', async (req, res) => {
  console.log("received request for equipment tags")
  try {
    const { rows } = await pool.query('SELECT DISTINCT equipment_tag FROM equipment_hours ORDER BY equipment_tag');
    res.json(rows.map(row => row.equipment_tag));
  } catch (err) {
    console.error('Error querying distinct equipment tags:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//to get the latest reading from all equipment_tags
app.get('/api/latest-equipment-hours', async (req, res) => {
  console.log("received request for all equipment tag, latest readings")
  try {
    const queryText = `
      SELECT DISTINCT ON (equipment_tag) *
      FROM equipment_hours
      ORDER BY equipment_tag, entry_date DESC;
    `;
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error('Error querying latest equipment hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get the latest reading from a specific equipment tag
app.get('/api/latest-equipment-hours/:tag', async (req, res) => {
  console.log("received request for specific equipment tag, latest reading")
  const tag = req.params.tag;
  try {
    const query = `
      SELECT * FROM equipment_hours 
      WHERE equipment_tag = $1 
      ORDER BY entry_date DESC 
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [tag]);
    if (rows.length > 0) {
      console.log(`sending equipment tag as object`);
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "No entries found for this equipment tag." });
    }
  } catch (err) {
    console.error('Error querying latest equipment hours for tag:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
