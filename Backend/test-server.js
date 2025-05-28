const express = require("express");
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test route for reports
app.get('/reports/test', (req, res) => {
  res.json({ 
    message: 'Reports endpoint is working!',
    timestamp: new Date()
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
