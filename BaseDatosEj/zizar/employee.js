const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all employees
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM employee");
  res.json(rows);
});

// GET employee by SSN
router.get("/:ssn", async (req, res) => {
  const ssn = req.params.ssn;
  const [rows] = await db.query("SELECT * FROM employee WHERE Ssn = ?", [ssn]);

  if (rows.length === 0) return res.status(404).json({ msg: "Empleado no encontrado" });
  res.json(rows[0]);
});

// CREATE employee
router.post("/", async (req, res) => {
  const data = req.body;

  try {
    const sql = `
      INSERT INTO employee (Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      data.Fname,
      data.Minit,
      data.Lname,
      data.Ssn,
      data.Bdate,
      data.Address,
      data.Sex,
      data.Salary,
      data.Super_ssn,
      data.Dno
    ]);

    res.json({ msg: "Empleado creado correctamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE employee
router.put("/:ssn", async (req, res) => {
  const ssn = req.params.ssn;
  const data = req.body;

  try {
    const sql = `
      UPDATE employee SET
        Fname=?, Minit=?, Lname=?, Bdate=?, Address=?, Sex=?, Salary=?, Super_ssn=?, Dno=?
      WHERE Ssn=?
    `;

    await db.query(sql, [
      data.Fname,
      data.Minit,
      data.Lname,
      data.Bdate,
      data.Address,
      data.Sex,
      data.Salary,
      data.Super_ssn,
      data.Dno,
      ssn
    ]);

    res.json({ msg: "Empleado actualizado correctamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE employee
router.delete("/:ssn", async (req, res) => {
  const ssn = req.params.ssn;

  try {
    await db.query("DELETE FROM employee WHERE Ssn = ?", [ssn]);
    res.json({ msg: "Empleado eliminado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
