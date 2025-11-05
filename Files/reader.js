'use strict';

const express = require('express');
const app = express();

const fs = require('fs');

app.get('/validacionT/:texto', (req, res) => {
  const texto = req.params.texto;
  res.status(200).send(texto);
});

function handleError(err) {
  console.error('Error:', err);
}

function printContents(contents) {
  console.log('Contenido del archivo:', contents);
}

fs.readFile('example.txt', 'utf8', (err, contents) => {
  if (err) {
    handleError(err);
  } else {
    printContents(contents);
  }
});

fs.writeFile('example.txt', 'Sample Text', (err) => {
  if (err) {
    handleError(err);
  } else {
    console.log('Archivo actualizado correctamente');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
