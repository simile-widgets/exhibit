/**
 * Module dependencies.
 */

var express = require('express');
var exhibit = require('exhibit');
var cors = require('cors');
//var stage = require('stage');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(cors([]));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});


// Routes
app.get('/', function(req, res) {
    res.redirect('http://simile-widgets.org/exhibit3/');
});

app.get('/api/ping', function(req, res) {
    var resp;
    res.contentType('json');
    if (typeof req.query.ping === "undefined") {
        resp = "ping";
    } else {
        resp = req.query.ping;
    }
    res.send(JSON.stringify({"pong": resp}));
});

app.get('/api/initialized', function(req, res) {
    // var init = stage.isInitialized(req);
    res.contentType('json');
    res.send(JSON.stringify({"initialized": false}));
});

app.get('/api/initialize-session', function(req, res) {
    // stage.createExhibit(req,
    //     req.query.refererUrlSHA1,
    //     req.query.isid);
    res.contentType('json');
    res.send(JSON.stringify({"status": "OK"}));
});

/**
 * It's not clear we want to follow this mode, precisely.  It's
 * likely people who want a bigger Exhibit will run this themselves
 */
app.get('/api/add-data-links', function(req, res) {
    var i, link, url, links = JSON.parse(req.query.links);
    for (i = 0; i < links.length; i++) {
        var link = links[i];
        var url = link.url
        if (url === "http://localhost/") {
            exhibit.addHostedDataLink();
        } else {
            exhibit.addDataLink(
                link.url,
                (link.mimeType !== null && link.mimeType !== "") ? link.mimeType : "application/json",
                (link.charset !== null && link.charset !== "") ? link.charset : "utf-8");
        }
    }
    res.contentType("json");
    res.send(JSON.stringify({"status":"OK"}));
});

app.get('/api/configure-from-dom', function(req, res) {
    
});

app.get('/api/facet-apply-restrictions', function(req, res) {
});

app.get('/api/facet-clear-restrictions', function(req, res) {
});

app.get('/api/generate-lens', function(req, res) {
});

app.get('/api/db', function(req, res) {
    res.contentType('json');
    res.send(JSON.stringify(exhibit.getDatabase(req.query.q)));
});


// Start server
app.listen(3000);
