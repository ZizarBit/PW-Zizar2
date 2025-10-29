'use strict';

const express = require('express');
const app = express();

app.get('/', (req,res) => {
  res.send('Hello from Math API!')
});

app.get('/circle/:r', (req,res)=>{
  const r = parseFloat(req.params.r);
  const circle = {
    area: Math.PI * r* r,
    circumference: Math.PI * (2 * r)
  };
  res.status(200).json(circle);
})

//25 y 20 triangulo
app.get('/triangle/:base/:altura', (req,res) =>{
  const base = parseFloat(req.params.base);
  const altura = parseFloat(req.params.altura);

  const triangle ={
    area: (base * altura)/2
  };
  res.status(200).json(triangle);
})

app.get('/cuadrado/:base/:altura', (req,res) => {
  const base = parseFloat(req.params.base);
  const altura = parseFloat(req.params.altura);

  const quads = {
    area: (base * altura)
  };
  res.status(200).json(triangle);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});