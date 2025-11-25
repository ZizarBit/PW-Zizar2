const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./zizar/employee");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/employees", employeeRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
