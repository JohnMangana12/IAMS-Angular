const express = require('express');
const app = express();
const port = 3000;
app.use(express.json())

// Mock user data for demonstration
const users = {
    "admin": { "password": "password" },
    "user": { "password": "userpass" }
};

// Authentication route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (user && user.password === password) {
        res.json({ success: true, message: "Login successful!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials!" });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
