//const fs = require('fs')
//const https = require('https')
const express = require('express');
const compression = require('compression')
const rateLimiter = require("express-rate-limit"); 
const mysql = require('mysql2');
const mysql_config = require('./mysql_config.js');
const server_config = require('./server_config.js');

const hostname = server_config.hostname
const port = server_config.port;
const rateLimit = rateLimiter({
    max: 60, //60 requests before rate limit
    windowMs: 60000, //reset count every after 1 min
});
var app = express();

app.disable('x-powered-by');
app.use(rateLimit);
app.use(compression());

app.use((req, res, next) => {
    //res.set('Strict-Transport-Security','max-age=86400; includeSubDomains');
	res.set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'none';");
    res.set('X-Frame-Options', 'deny');
	res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'no-referrer');
	res.set('Access-Control-Allow-Origin', 'null');
	res.set('Cache-Control', 'public, max-age=86400');
    next();
});

app.get('/search', (req, res) => {
	console.log('Search Query: ['+req.ip+'] '+JSON.stringify(req.query))
	let sql = 'SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM tamugrades WHERE'
	    +' (departmentName='+mysql.escape(req.query['d'])+')'+' AND (course='+mysql.escape(req.query['c'])+')';
	let con = mysql.createConnection(mysql_config.databaseOptions);
	con.connect(function(err) {
        if (err) throw err;
        con.query(sql,(err, result) => {
            if (err) {res.write(err.toString(), () => {res.end();});}
            else {res.write(JSON.stringify(result), () => {res.end();});}
        });
	});
});

app.use(express.static('public'));

app.use(function(req, res) {
    res.status(404).sendFile('public/404.html', { root: __dirname });
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/*
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(port, hostname, () => {
    console.log(`Server running at https://${hostname}:${port}/`);
});
*/