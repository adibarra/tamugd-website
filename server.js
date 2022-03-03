const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const mysql = require('mysql2');
const mysqlConfig = require('./mysql_config.js');
const serverConfig = require('./server_config.js').serverConfig;

var app = express();
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
    next();
});

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => {
    res.status(200).sendFile(__dirname+'/public/images/favicons/favicon.ico');
});

app.get('/search', (req, res) => {
    let now = new Date();
    let date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    let time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+'.'+('0'+now.getSeconds()).slice(-2);
    let sql = 'SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM '+mysqlConfig.tableName+' WHERE'
        +' (departmentName='+mysql.escape(req.query['d'].replace(/[\W]+/g, ''))+') AND (course='+mysql.escape(req.query['c'].replace(/[\W]+/g, ''))+');';
    let con = mysql.createConnection(mysqlConfig.databaseSettings);
    con.connect(function(err) {
        if (err) throw err;
        con.query(sql, (err, result) => {
            if (err) {res.write(err.toString(), () => {res.end();});}
            else {res.write(JSON.stringify(result), () => {res.end();});}
            console.log('['+date+'::'+time+'] ['+(req.headers['x-forwarded-for'])+'] ['+(result.length>0?'SUCCESS':'FAILURE')+'] '+JSON.stringify(req.query));
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
