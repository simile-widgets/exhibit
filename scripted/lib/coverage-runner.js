/**
 * @fileOverview Initiates coverage reporting.
 */

var args = arguments;

(function(){
    load('lib/coverage-setup.js');
    console.log("Starting coverage reporting...");
    window.location = "http://127.0.0.1:"+args[0]+"/build/instrument/tests/index.html";
})();
