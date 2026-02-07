//const fs = require('fs');
//const https = require('https');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt

dotenv.config();
const app = express();
const port = 3000;

app.use(cors({
    // Allow both your specific IP AND localhost:4200
    origin: ['http://localhost:4200', 'https://10.164.199.3'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Remove the SSL section entirely
});
pool.on('error', (err) => {
    console.error('Error with database pool:', err);
});

app.get('/', (req, res) => {
    res.send('Welcome to asset management API!');
});

// Modified /assets endpoint to select all relevant columns and allow filtering by AgileReleaseTrain
app.get('/assets', async (req, res) => {
  try {
    let query = 'SELECT id, "AssetTag", "Description", "Location", "SerialNumber", "AssetCondition", "Specification", "GroupAssetCategory", "PoNumber", "Warranty", "DateAcquired", "CheckoutTo", "AssetCategory", "CostCenter", "ScrumTeam", "AgileReleaseTrain" FROM assets';
    const queryParams = [];
    let paramIndex = 1;

    // *** MODIFICATION HERE for global search ***
    // Check if a search term is provided in the query parameters
    if (req.query.search) {
      const searchTerm = req.query.search;
      // If this is the first condition, start with WHERE, otherwise use AND
      if (queryParams.length === 0) {
        query += ' WHERE ';
      } else {
        query += ' AND ';
      }

      // Build the search condition to include AssetTag, Description, SerialNumber, CostCenter, and AgileReleaseTrain
      // Use ILIKE for case-insensitive matching and '%' for partial matching.
      query += `("AssetTag" ILIKE $${paramIndex} OR "Description" ILIKE $${paramIndex} OR "SerialNumber" ILIKE $${paramIndex} OR "CostCenter" ILIKE $${paramIndex} OR "AgileReleaseTrain" ILIKE $${paramIndex})`;

      // Add the search term for each ILIKE condition
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Filter by AgileReleaseTrain if provided
    if (req.query.AgileReleaseTrain !== undefined && req.query.AgileReleaseTrain !== null && req.query.AgileReleaseTrain !== '') {
      if (queryParams.length === 0) query += ' WHERE ';
      else query += ' AND ';
      query += `"AgileReleaseTrain" = $${paramIndex}`;
      queryParams.push(req.query.AgileReleaseTrain);
      paramIndex++;
    }

    // Add other filters as previously implemented if needed, for example:
    // Filter by GroupAssetCategory if provided
    if (req.query.GroupAssetCategory) {
      if (queryParams.length === 0) query += ' WHERE ';
      else query += ' AND ';
      query += `"GroupAssetCategory" = $${paramIndex}`;
      queryParams.push(req.query.GroupAssetCategory);
      paramIndex++;
    }

    // Filter by AssetCondition if provided
    if (req.query.AssetCondition){
      if (queryParams.length === 0) query += 'WHERE';
      else query += ' AND ';
      query += `"AssetCondition" = $${paramIndex}`;
      queryParams.push(req.query.AssetCondition);
      paramIndex++;
    }

    // Filter by CheckoutTo if provided
    if (req.query.CheckoutTo !== undefined && req.query.CheckoutTo !== null && req.query.CheckoutTo !== '') {
      if (queryParams.length === 0) query += ' WHERE ';
      else query += ' AND ';
      query += `"CheckoutTo" = $${paramIndex}`;
      queryParams.push(req.query.CheckoutTo);
      paramIndex++;
    }

    // Filter by ScrumTeam if provided
    if (req.query.ScrumTeam !== undefined && req.query.ScrumTeam !== null && req.query.ScrumTeam !== '') {
      if (queryParams.length === 0) query += ' WHERE ';
      else query += ' AND ';
      query += `"ScrumTeam" = $${paramIndex}`;
      queryParams.push(req.query.ScrumTeam);
      paramIndex++;
    }


    console.log("SQL Query:", query); // Debugging the generated query
    console.log("Query Params:", queryParams); // Debugging the parameters
    const result = await pool.query(query, queryParams);
    console.log('Data being sent:', result.rows); // ADD THIS LINE
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Error fetching assets' });
  }
});
app.post('/assets', async (req, res) => {
    const newAsset = req.body;
    try{
    const query = {
      // 1. Add "DateAcquired" to the columns list
      // 2. Add a new placeholder, $13
    text: 'INSERT INTO assets ("AssetTag", "Description", "Location", "SerialNumber", "AssetCondition", "Specification", "GroupAssetCategory", "PoNumber", "Warranty", "CheckoutTo", "AssetCategory", "CostCenter", "DateAcquired", "ScrumTeam", "AgileReleaseTrain") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
      // 3. Add "DateAcquired" to the values array
    values: [newAsset.AssetTag,
      newAsset.Description,
      newAsset.Location,
      newAsset.SerialNumber,
      newAsset.AssetCondition,
      newAsset.Specification,
      newAsset.GroupAssetCategory,
      newAsset.PoNumber,
      newAsset.Warranty, // This can be null
      newAsset.CheckoutTo,
      newAsset.AssetCategory,
      newAsset.CostCenter,
      newAsset.DateAcquired, // This can also be null
      newAsset.ScrumTeam, // Corrected: Removed trailing comma
      newAsset.AgileReleaseTrain

    ],
    };
    await pool.query(query);
    res.status(201).json({ message: "Asset created successfully" });
    }
        catch (error){
        console.error('Error creating assets:', error);
        res.status(500).json({ error: 'Error creating assets' });
    }
});
app.put('/assets/:id', async (req, res) => {
  const assetId = req.params.id;
  const updatedAsset = req.body;
  try {
      const query = {
            // 1. Add "DateAcquired" = $13 to the SET clause
            // 2. Change the WHERE id placeholder from $13 to $14
          text: 'UPDATE assets SET "AssetTag" = $1, "Description" = $2, "Location" = $3, "SerialNumber" = $4, "AssetCondition" = $5, "Specification" = $6, "GroupAssetCategory" = $7, "PoNumber" = $8, "Warranty" = $9, "CheckoutTo" = $10, "AssetCategory" = $11, "CostCenter" = $12, "DateAcquired" =$13, "ScrumTeam" = $14, "AgileReleaseTrain" = $15 WHERE id = $16',
            // 3. Add updatedAsset.DateAcquired to the values array in the correct position
          values: [
              updatedAsset.AssetTag,
              updatedAsset.Description,
              updatedAsset.Location,
              updatedAsset.SerialNumber,
              updatedAsset.AssetCondition,
              updatedAsset.Specification,
              updatedAsset.GroupAssetCategory,
              updatedAsset.PoNumber,
              updatedAsset.Warranty,
              updatedAsset.CheckoutTo,
              updatedAsset.AssetCategory,
              updatedAsset.CostCenter,
              updatedAsset.DateAcquired,
              updatedAsset.ScrumTeam,
              updatedAsset.AgileReleaseTrain,
              parseInt(assetId, 10) // The value for $15
          ],
      };
      await pool.query(query);
      res.status(200).json({ message: 'Asset updated successfully' });
  } catch (error) {
      console.error('Error updating asset:', error);
      res.status(500).json({ error: 'Error updating asset' });
  }
});

app.delete('/assets/:id', async (req, res) => {
  const assetId = req.params.id;
  try {
      await pool.query('DELETE FROM assets WHERE id = $1', [parseInt(assetId, 10)]);
      res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).json({ error: 'Error deleting asset' });
  }
});


// REVISED AND CORRECTED ENDPOINT FOR DASHBOARD WIDGETS
app.get('/assets/summary', async (req, res) => {
    try {
        // This single query does all the counting on the database side
        const query = `
            SELECT
                COUNT(*) FILTER (WHERE "AssetCategory" IN ('Rack Type Server', 'Tower Type Server')) AS servers,
                COUNT(*) FILTER (WHERE "AssetCategory" IN ('Desktop', 'Workstation')) AS desktops,
                COUNT(*) FILTER (WHERE "GroupAssetCategory" = 'Delta V Hardware') AS deltaV,
                COUNT(*) FILTER (WHERE "AssetCategory" = 'Laptop') AS laptops
            FROM assets
        `;

        const result = await pool.query(query);

        // The query returns a single row with all our counts.
        // Example: { rows: [{ servers: '10', desktops: '50', deltav: '5506', thirdparty: '30' }] }
        const counts = result.rows[0];

        // Directly use the results from the database.
        // We use parseInt to ensure they are numbers, and || 0 as a safety net.
        const summary = {
            servers:    parseInt(counts.servers, 10) || 0,
            desktops:   parseInt(counts.desktops, 10) || 0,
            deltaV:     parseInt(counts.deltav, 10) || 0, // SQL aliases are lowercase by default
            laptops:    parseInt(counts.laptops, 10) || 0
        };

        res.json(summary);

    } catch (error) {
        console.error('Error fetching asset summary:', error);
        res.status(500).json({ error: 'Error fetching asset summary' });
    }
});

// NEW ENDPOINT FOR MONTHLY CHART
app.get('/assets/by-month', async (req, res) => {
  try {
    const agileReleaseTrain = req.query.AgileReleaseTrain; // Get the query parameter

    let query = `
      SELECT
        m.month,
        COALESCE(COUNT(a.id) FILTER (
          WHERE a."AssetCategory" IN ('Rack Type Server', 'Tower Type Server') ${agileReleaseTrain ? 'AND a."AgileReleaseTrain" = $1' : ''}
        ), 0) AS servers_count,
        COALESCE(COUNT(a.id) FILTER (
          WHERE a."AssetCategory" IN ('Desktop', 'Workstation') ${agileReleaseTrain ? 'AND a."AgileReleaseTrain" = $2' : ''}
        ), 0) AS desktops_count,
        COALESCE(COUNT(a.id) FILTER (
          WHERE a."GroupAssetCategory" = 'Delta V Hardware' ${agileReleaseTrain ? 'AND a."AgileReleaseTrain" = $3' : ''}
        ), 0) AS deltav_count
      FROM
        generate_series(1, 12) AS m(month)
      LEFT JOIN
        assets a ON m.month = EXTRACT(MONTH FROM a."DateAcquired")
                 AND EXTRACT(YEAR FROM a."DateAcquired") = EXTRACT(YEAR FROM NOW())
                 ${agileReleaseTrain ? 'AND a."AgileReleaseTrain" = $4' : ''}
      GROUP BY
        m.month
      ORDER BY
        m.month;
    `;

    // Adjust parameter indices if AgileReleaseTrain is present
    let params = [];
    if (agileReleaseTrain) {
      // Note: The SQL string has placeholders $1, $2, $3, $4 if agileReleaseTrain is used
      // The exact indices will depend on the order of filters.
      // Let's rebuild the query to manage indices properly.
      let queryParts = [
        'SELECT m.month,',
        `COALESCE(COUNT(a.id) FILTER (WHERE a."AssetCategory" IN ('Rack Type Server', 'Tower Type Server')`,
        `COALESCE(COUNT(a.id) FILTER (WHERE a."AssetCategory" IN ('Desktop', 'Workstation')`,
        `COALESCE(COUNT(a.id) FILTER (WHERE a."GroupAssetCategory" = 'Delta V Hardware'`,
        'FROM generate_series(1, 12) AS m(month) LEFT JOIN assets a ON m.month = EXTRACT(MONTH FROM a."DateAcquired") AND EXTRACT(YEAR FROM a."DateAcquired") = EXTRACT(YEAR FROM NOW())'
      ];
      let paramIdx = 1;

      if (agileReleaseTrain) {
        queryParts[1] += ` AND a."AgileReleaseTrain" = $${paramIdx}`; params.push(agileReleaseTrain); paramIdx++;
        queryParts[2] += ` AND a."AgileReleaseTrain" = $${paramIdx}`; params.push(agileReleaseTrain); paramIdx++;
        queryParts[3] += ` AND a."AgileReleaseTrain" = $${paramIdx}`; params.push(agileReleaseTrain); paramIdx++;
        queryParts[4] += ` AND a."AgileReleaseTrain" = $${paramIdx}`; params.push(agileReleaseTrain); paramIdx++;
      }

      queryParts[1] += '), 0) AS servers_count,';
      queryParts[2] += '), 0) AS desktops_count,';
      queryParts[3] += '), 0) AS deltav_count';
      queryParts[4] += ' GROUP BY m.month ORDER BY m.month;';

      query = queryParts.join(' ');
    }

    const result = await pool.query(query, params); // Pass params

    const chartData = {
      servers:  result.rows.map(row => parseInt(row.servers_count, 10)),
      desktops: result.rows.map(row => parseInt(row.desktops_count, 10)),
      deltaV:   result.rows.map(row => parseInt(row.deltav_count, 10)),
    };
    res.json(chartData);

  } catch (error) {
    console.error('Error fetching assets by month:', error);
    res.status(500).json({ error: 'Error fetching assets by month' });
  }
});

// NEW ENDPOINT FOR YEARLY ASSET COUNTS
app.get('/assets/by-year', async (req, res) => {
  try {
    const agileReleaseTrain = req.query.AgileReleaseTrain; // Get the query parameter

    let query = `
      SELECT
        EXTRACT(YEAR FROM "DateAcquired") AS acquisition_year,
        COUNT(id) AS total_count
        ${agileReleaseTrain ? `, COUNT(id) FILTER (WHERE "AgileReleaseTrain" = $1) AS filtered_count` : ''}
      FROM
        assets
      WHERE
        "DateAcquired" IS NOT NULL
        ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $2' : ''}
      GROUP BY
        acquisition_year
      ORDER BY
        acquisition_year ASC;
    `;

    let params = [];
    if (agileReleaseTrain) {
      params.push(agileReleaseTrain);
      params.push(agileReleaseTrain); // Another parameter for the WHERE clause
    }

    const result = await pool.query(query, params);

    const chartData = {
      years: result.rows.map(row => ({
        year: parseInt(row.acquisition_year, 10),
        totalCount: parseInt(row.total_count, 10),
        // If filtered_count exists, use it. Otherwise, this might be null or undefined.
        // For simplicity, we are not creating a new series for it in the component unless specifically asked.
        // filteredCount: agileReleaseTrain ? parseInt(row.filtered_count, 10) : undefined
      }))
    };
    res.json(chartData);

  } catch (error) {
    console.error('Error fetching assets by year:', error);
    res.status(500).json({ error: 'Error fetching assets by year' });
  }
});


// NEW ENDPOINT FOR ASSET COUNT BY CONDITION
app.get('/assets/by-condition', async (req, res) => {
  try {
    const agileReleaseTrain = req.query.AgileReleaseTrain; // Get the query parameter

    let query = `
      SELECT "AssetCondition", COUNT(*) AS count
      FROM assets
      WHERE 1=1
      ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $1' : ''}
      GROUP BY "AssetCondition"
    `;

    let params = [];
    if (agileReleaseTrain) {
      params.push(agileReleaseTrain);
    }

    const result = await pool.query(query, params);

    const formattedData = result.rows.map(row => ({
      name: row.AssetCondition,
      y: parseInt(row.count, 10)
    }));

    res.json(formattedData);

  } catch (error) {
    console.error('Error fetching assets by condition:', error);
    res.status(500).json({ error: 'Error fetching assets by condition' });
  }
});

// NEW ENDPOINT FOR WARRANTY MONITORING (MODIFIED)
app.get('/assets/warranty-status', async (req, res) => {
  try {
    const agileReleaseTrain = req.query.AgileReleaseTrain; // Get the query parameter

    let query = `
            SELECT
              -- Laptop
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Laptop' AND "Warranty" IS NOT NULL AND "Warranty" >= NOW() ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $1' : ''}) AS laptop_has_warranty,
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Laptop' AND ("Warranty" IS NULL OR "Warranty" < NOW()) ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $2' : ''}) AS laptop_no_warranty,

              -- Desktop
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Desktop' AND "Warranty" IS NOT NULL AND "Warranty" >= NOW() ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $3' : ''}) AS desktop_has_warranty,
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Desktop' AND ("Warranty" IS NULL OR "Warranty" < NOW()) ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $4' : ''}) AS desktop_no_warranty,

              -- Workstation
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Workstation' AND "Warranty" IS NOT NULL AND "Warranty" >= NOW() ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $5' : ''}) AS workstation_has_warranty,
              COUNT(*) FILTER (WHERE "AssetCategory" = 'Workstation' AND ("Warranty" IS NULL OR "Warranty" < NOW()) ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $6' : ''}) AS workstation_no_warranty,

              -- Server (Rack Type Server, Tower Type Server)
              COUNT(*) FILTER (WHERE "AssetCategory" IN ('Rack Type Server', 'Tower Type Server') AND "Warranty" IS NOT NULL AND "Warranty" >= NOW() ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $7' : ''}) AS server_has_warranty,
              COUNT(*) FILTER (WHERE "AssetCategory" IN ('Rack Type Server', 'Tower Type Server') AND ("Warranty" IS NULL OR "Warranty" < NOW()) ${agileReleaseTrain ? 'AND "AgileReleaseTrain" = $8' : ''}) AS server_no_warranty
            FROM
              assets;
          `;
    let params = [];
    if (agileReleaseTrain) {
      for (let i = 1; i <= 8; i++) {
        params.push(agileReleaseTrain);
      }
    }

    const result = await pool.query(query, params);

    const counts = result.rows[0];

    const warrantySummary = {
      laptop: {
        hasWarranty: parseInt(counts.laptop_has_warranty, 10) || 0,
        noWarranty: parseInt(counts.laptop_no_warranty, 10) || 0,
      },
      desktop: {
        hasWarranty: parseInt(counts.desktop_has_warranty, 10) || 0,
        noWarranty: parseInt(counts.desktop_no_warranty, 10) || 0,
      },
      workstation: {
        hasWarranty: parseInt(counts.workstation_has_warranty, 10) || 0,
        noWarranty: parseInt(counts.workstation_no_warranty, 10) || 0,
      },
      server: {
        hasWarranty: parseInt(counts.server_has_warranty, 10) || 0,
        noWarranty: parseInt(counts.server_no_warranty, 10) || 0,
      },
    };
    res.json(warrantySummary);

  } catch (error) {
    console.error('Error fetching warranty status:', error);
    res.status(500).json({ error: 'Error fetching warranty status' });
  }
});

// -- New user routes for account management --

// Get all users
app.get('/users', async (req, res) => {
    try {
        // Added agile_train and scrum_team to the SELECT statement
        const result = await pool.query('SELECT id, username, email, first_name, last_name, role, agile_train, scrum_team, status, created_at, updated_at FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});
// Get a user by ID
app.get('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    try {

        const result = await pool.query('SELECT id, username, email, first_name, last_name, role, agile_train, scrum_team, status, created_at, updated_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found'});
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user'});
    }
});

// POST a new user
app.post('/users', async (req, res) => {
    // 1. Destructure input
    const { username, email, first_name, last_name, role, status, agile_train, scrum_team, password } = req.body;

    // 2. Validation
    if (!username || !email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Username, email, first name, last name, and password are required.' });
    }

    try {
        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insert into DB with is_default_password = TRUE
        const result = await pool.query(
            `INSERT INTO users
            (username, email, first_name, last_name, role, status, agile_train, scrum_team, password, is_default_password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, username, email, first_name, last_name, role, status, agile_train, scrum_team, created_at, updated_at`,
            [
                username,
                email,
                first_name,
                last_name,
                role || 'user',
                status || 'active',
                agile_train,
                scrum_team,
                hashedPassword,
                true // <--- FORCE THIS TO TRUE ON CREATION
            ]
        );
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }
        res.status(500).json({ error: 'Error creating user' });
    }
});

// PUT (Update) an existing user
app.put('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  // Include password in the destructuring, but handle it separately if it's optional for update
  const { username, email, first_name, last_name, role, status, agile_train, scrum_team, password } = req.body;
  if (!username || !email || !first_name || !last_name) {
    return res.status(400).json({ error: 'Username, email, first name, and last name are required.' });
  }

  let queryParams = [username, email, first_name, last_name, role, status, agile_train, scrum_team, userId];
  let updateFields = '"username" = $1, "email" = $2, "first_name" = $3, "last_name" = $4, "role" = $5, "status" = $6, "agile_train" = $7, "scrum_team" = $8';

  try {
    // Handle password update separately if a new password is provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields += ', "password" = $9'; // Add password to update fields
      queryParams.splice(8, 0, hashedPassword); // Insert hashedPassword at the correct position ($9)
      queryParams.push(userId); // The ID is now $10
      const result = await pool.query(
        `UPDATE users SET ${updateFields} WHERE id = $10 RETURNING id, username, email, first_name, last_name, role, status, agile_train, scrum_team, created_at, updated_at`,
        queryParams
      );
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'User updated successfully', user: result.rows[0] });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // If no password is provided, update without changing the password
      const result = await pool.query(
        `UPDATE users SET ${updateFields} WHERE id = $9 RETURNING id, username, email, first_name, last_name, role, status, agile_train, scrum_team, created_at, updated_at`,
        queryParams
      );
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'User updated successfully', user: result.rows[0] });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: 'Error updating user' });
  }
});

// DELETE a user
app.delete('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});
// NEW ENDPOINT: Change password after first-time login/OTP
app.post('/change-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body; // currentPassword is the OTP

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Username, current password, and new password are required.' });
    }

    try {
        // 1. Fetch user to verify current password (OTP) and check flag
        const userResult = await pool.query(
            'SELECT id, password, is_default_password FROM users WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const user = userResult.rows[0];

        // 2. Verify current password (OTP)
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid current password (OTP).' });
        }

        // 3. Optional: Check if password change is actually required (good practice)
        if (user.is_default_password !== true) {
            // Note: Depending on your security policy, you might still allow the update here
            // but for a mandatory flow, this check is good.
            // If you want to allow a general password update, remove this check.
            // For now, we keep it to enforce the "default password" rule.
            return res.status(403).json({ error: 'Password change not required for this user. If you wish to change your password, please use the account settings page.' });
        }

        // 4. Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 5. Update the password and clear the is_default_password flag
        await pool.query(
            'UPDATE users SET password = $1, is_default_password = FALSE WHERE id = $2',
            [newHashedPassword, user.id]
        );

        res.json({ message: 'Password updated successfully. You can now access the dashboard.' });

    } catch (error) {
        console.error('Error during password change:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// NEW ENDPOINT FOR USER LOGIN (Modified to include the flag)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Fetch is_default_password
        const result = await pool.query('SELECT id, username, email, role, first_name, last_name, password, agile_train, scrum_team, is_default_password FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Send response
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                // The Angular app will check this property:
                requiresPasswordChange: user.is_default_password
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ==========================================
// LICENSE MANAGEMENT ROUTES
// ==========================================

// 1. GET ALL LICENSES (with optional type filter)
app.get('/licenses', async (req, res) => {
    try {
        const { license_type } = req.query;
        let query = 'SELECT * FROM licenses';
        let values = [];

        // Filter by type if provided (e.g., Subscription, Perpetual)
        if (license_type && license_type !== 'All') {
            query += ' WHERE license_type = $1';
            values.push(license_type);
        }

        query += ' ORDER BY id DESC'; // Show newest first

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching licenses:', err.message);
        res.status(500).json({ error: 'Server Error fetching licenses' });
    }
});

// 2. CREATE NEW LICENSE (POST)
app.post('/licenses', async (req, res) => {
    try {
        const {
            product_name,
            license_key,
            license_type,
            serial_number,
            cost_center,
            vendor,
            contract_date
        } = req.body;

        const newLicense = await pool.query(
            `INSERT INTO licenses
            (product_name, license_key, license_type, serial_number, cost_center, vendor, contract_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [product_name, license_key, license_type, serial_number, cost_center, vendor, contract_date]
        );

        res.status(201).json(newLicense.rows[0]);
    } catch (err) {
        console.error('Error creating license:', err.message);
        res.status(500).json({ error: 'Server Error creating license' });
    }
});

// 3. UPDATE LICENSE (PUT)
app.put('/licenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            license_key,
            license_type,
            serial_number,
            cost_center,
            vendor,
            contract_date
        } = req.body;

        const updateLicense = await pool.query(
            `UPDATE licenses
            SET product_name = $1,
                license_key = $2,
                license_type = $3,
                serial_number = $4,
                cost_center = $5,
                vendor = $6,
                contract_date = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8`,
            [product_name, license_key, license_type, serial_number, cost_center, vendor, contract_date, id]
        );

        res.json({ message: 'License updated successfully' });
    } catch (err) {
        console.error('Error updating license:', err.message);
        res.status(500).json({ error: 'Server Error updating license' });
    }
});

// 4. DELETE LICENSE
app.delete('/licenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM licenses WHERE id = $1', [id]);
        res.json({ message: 'License deleted successfully' });
    } catch (err) {
        console.error('Error deleting license:', err.message);
        res.status(500).json({ error: 'Server Error deleting license' });
    }
});



app.listen(port, '0.0.0.0', () => {
    console.log(`Node API running internally on port ${port}`);
});
