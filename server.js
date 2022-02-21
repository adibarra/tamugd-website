const express = require('express');
const compression = require('compression')
const rateLimiter = require("express-rate-limit"); 
const mysql = require('mysql2');
const mysqlConfig = require('./mysql_config.js');
const serverConfig = require('./server_config.js').serverConfig;

var app = express();
app.use(rateLimiter({ max: 60, windowMs: 60000 }));
app.use(compression());
app.disable('x-powered-by');

app.use((req, res, next) => {
    res.set('Upgrade-Insecure-Requests', 1);
    res.set('Strict-Transport-Security','max-age=86400; includeSubDomains');
    res.set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'none';");
    res.set('X-Frame-Options', 'deny');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Access-Control-Allow-Origin', 'null');
    res.set('Cache-Control', 'public, max-age=86400');
    next();
});

app.use(express.static('public'));

app.get('/search', (req, res) => {
    let now = new Date();
    let date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    let time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+'.'+('0'+now.getSeconds()).slice(-2);
    console.log('['+date+'::'+time+'] ['+req.ip+'] '+JSON.stringify(req.query))
    let sql = 'SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM '+mysqlConfig.tableName+' WHERE'
        +' (departmentName='+mysql.escape(req.query['d'])+')'+' AND (course='+mysql.escape(req.query['c'])+')';
    let con = mysql.createConnection(mysqlConfig.databaseSettings);
    con.connect(function(err) {
        if (err) throw err;
        con.query(sql,(err, result) => {
            if (err) {res.write(err.toString(), () => {res.end();});}
            else {res.write(JSON.stringify(result), () => {res.end();});}
            con.end();
        });
    });
});

app.use(function(req, res) {
    res.status(404).sendFile('public/404.html', { root: __dirname });
});

app.listen(serverConfig.port, () => {
    console.log(`Server running on port: ${serverConfig.port}`);
});
