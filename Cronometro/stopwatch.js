'use strict';
(function() {
  let detener = 0;
  let timerId = null;
  let conta = 0;

  window.addEventListener('load', init);

  function init() {
    id('stopwatch').addEventListener('click', toggleStopwatch);
    id('reset').addEventListener('click', resetStopwatch);
  }

  function toggleStopwatch() {
    if (timerId === null) {
      timerId = setInterval(() => {
        detener++;
        id("timer").textContent = detener + " segundos";
      }, 1000);
    } else {
      clearInterval(timerId);
      timerId = null;
      console.log("Medio muerto");
    }
    //incia-pausa
  }


  function resetStopwatch() {
    detener = 0;
    id("timer").textContent = detener + " segundos";
    console.log("Se murio"+conta+" veces");
    //resetea
  }

  /* -------------------- Helper Function -------------------- */
  /**
   * id helper function
   * @param {String} idName name of id
   * @return {Object} element with id name
   */
  function id(idName) {
    return document.getElementById(idName);
  }
})();
