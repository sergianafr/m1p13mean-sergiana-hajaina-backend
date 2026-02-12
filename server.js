const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
const connectDB = require('./config/db');

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/type-magasins", require("./routes/type-magasin.route"));


connectDB();
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));