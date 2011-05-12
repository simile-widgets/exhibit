/**
 * @fileOverview Initiates coverage reporting.
 */

(function(){
    load('lib/coverage-setup.js');
    console.log("Starting coverage reporting...");
    window.location = "http://127.0.0.1:9876/build/instrument/tests/index.html";
})();
