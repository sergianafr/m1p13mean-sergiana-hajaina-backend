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



app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/type-magasins", require("./routes/type-magasin.route"));
app.use("/api/type-produits", require("./routes/type-produit.route"));
app.use("/api/unites", require("./routes/unite.route"));
app.use("/api/boxs", require("./routes/box.route"));
app.use("/api/loyer-boxs", require("./routes/loyer-box.route"));


app.use("/api/produits", require("./routes/produit.route"));
app.use("/api/magasin-boxs", require("./routes/magasin-box.route"));


connectDB();
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));