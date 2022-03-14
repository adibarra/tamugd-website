const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const mysql = require('mysql2');
const mysqlConfig = require('./mysql_config.js');
const serverConfig = require('./server_config.js').serverConfig;

// cached responses
const responseCache = [];

var app = express();
app.set('trust proxy', 1);
app.use(compression());

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'", 'https://www.google-analytics.com/g/'],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            "script-src": ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com/gtag/', 'https://www.google-analytics.com/g/'],
            "style-src": ["'self'", "'unsafe-inline'"],
            "font-src": ["'self'", 'https://stackpath.bootstrapcdn.com/font-awesome/', 'https://fonts.gstatic.com/s/'],
            "img-src": ["'self'", 'data:', 'https://www.google-analytics.com/g/']
        },
    }
}));

app.use((req, res, next) => {
    //res.set('Cache-Control', 'public, max-age=86400');
    if (req.get('Referrer')) console.log('['+(req.ip)+'] [Referrer: '+req.get('Referrer')+']');
    next();
});

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => {
    res.status(200).sendFile(__dirname+'/public/images/favicon.ico');
});

app.get('/supported', (req, res) => {
    let now = new Date();
    let date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    let time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+'.'+('0'+now.getSeconds()).slice(-2);

    for (let i = 0; i < responseCache.length; i++) {
        if (responseCache[i].query === 'supported') {
            res.write(responseCache[i].data, () => { res.end(); });
            console.log('['+date+'::'+time+'] ['+(req.ip)+'] [SUCCESS (Cached)] [GET '+req.url+']');
            return;
        }
    }
    let con = mysql.createConnection(mysqlConfig.databaseSettings);
    con.connect(function(err) {
        if (err) throw err;
        con.query('SELECT DISTINCT year FROM '+mysqlConfig.tableName+';', (err, result1) => {
            if (err) { res.write(err.toString(), () => { res.end(); }); }
            else {
                con.query('SELECT DISTINCT departmentName FROM '+mysqlConfig.tableName+';', (err, result2) => {
                    if (err) { res.write(err.toString(), () => { res.end(); }); }
                    else { res.write(JSON.stringify(result1)+'|'+JSON.stringify(result2), () => { res.end(); }); }
                    responseCache.push({ 'query': 'supported', 'data': JSON.stringify(result1)+'|'+JSON.stringify(result2) });
                    console.log('['+date+'::'+time+'] ['+(req.ip)+'] ['+((result1+result2).length>0?'SUCCESS':'FAILURE')+' (Queried)] [GET '+req.url+']');
                    con.end();
                });
            }
        });
    });
});

app.get('/search', (req, res) => {
    let now = new Date();
    let date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    let time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+'.'+('0'+now.getSeconds()).slice(-2);

    let queryString = mysql.escape(req.query['d'].replace(/[\W]+/g, '').toUpperCase())+' '+mysql.escape(req.query['c'].replace(/[\W]+/g, '').toUpperCase());
    for (let i = 0; i < responseCache.length; i++) {
        if (responseCache[i].query === queryString) {
            res.write(responseCache[i].data, () => { res.end(); });
            console.log('['+date+'::'+time+'] ['+(req.ip)+'] [SUCCESS (Cached)] [GET '+req.url+']');
            return;
        }
    }

    let sql = 'SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM '+mysqlConfig.tableName+' WHERE'
        +' (departmentName='+mysql.escape(req.query['d'].replace(/[\W]+/g, '').toUpperCase())+') AND (course='+mysql.escape(req.query['c'].replace(/[\W]+/g, '').toUpperCase())+');';
    let con = mysql.createConnection(mysqlConfig.databaseSettings);
    con.connect(function(err) {
        if (err) throw err;
        con.query(sql, (err, result) => {
            if (err) { res.write(err.toString(), () => {res.end();}); }
            else { res.write(JSON.stringify(result), () => {res.end();}); }
            responseCache.push({ 'query': queryString, 'data': JSON.stringify(result) });
            console.log('['+date+'::'+time+'] ['+(req.ip)+'] ['+(result.length>0?'SUCCESS':'FAILURE')+' (Queried)] [GET '+req.url+']');
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
