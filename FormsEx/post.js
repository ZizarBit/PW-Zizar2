/*
 * CSE 154
 */
'use strict';
(function() {
  const API_URL = '172.6.6.115:3000/users/login';

  window.addEventListener('load', init);

  /**
   * TODO - setup the sign-in button on initial page load
   */
  function init() {
    qs("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      await signIn();
    });
  }

  /**
   * TODO
   * signIn - Signs the user in based on username and password inputs
   */
  async function signIn() {
    try {
      let params = new FormData(qs("form"));
      //let params = JSON.stringify(qs("form"));

      let res = await fetch(API_URL, {
        method: "POST",
        body: params
      });
      await statusCheck(res);
      res = await res.text();
      id("secured-section").classList.remove("hidden");
      id("login-form").classList.add("hidden");
      id("error").classList.add("hidden");
    } catch (err) {
      handleError();
    }
  }

  function handleError() {
    id("error").classList.remove("hidden");
  }


  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();
