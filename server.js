const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const mysql = require('mysql2');
const mysqlConfig = require('./mysql_config.js');
const serverConfig = require('./server_config.js').serverConfig;

const app = express();
let responseCache = {};
let syncing = false;
let syncPercentage = '0';

function checkSyncStatus() {
    const conn = mysql.createConnection(mysqlConfig.databaseSettings);
    conn.connect((err) => {
        if (err) { console.log(err.toString); res.write('Backend Error', () => { res.end(); conn.end(); }); }
        else {
            conn.query('SELECT * FROM '+mysqlConfig.statusTable+';', (err, result) => {
                if (!err) {
                    if (result && result.length >= 2) {
                        syncing = result[0].value;
                        syncPercentage = result[1].value;
                    }
                }
                conn.end();
            });
        }
    });
    if (syncing) responseCache = {};
}

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
    if (req.get('Referrer')) console.log(`[${req.ip}] [Referrer: ${req.get('Referrer')}]`);
    next();
});

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => res.status(200).sendFile(__dirname+'/public/images/favicon.ico'));

app.get('/supported', (req, res) => {
    const now = new Date();
    const date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    const time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+':'+('0'+now.getSeconds()).slice(-2);

    // check if database is syncing, if so, clear cache
    checkSyncStatus();

    // check cache for response, if not, generate and store response
    if (!syncing && responseCache['supported']) {
        res.status(200).json(responseCache['supported']).end();
        console.log(`[${date}.${time}] [${req.ip}] [SUCCESS (Cached)] [GET ${req.url}]`);
    } else {
        const conn = mysql.createConnection(mysqlConfig.databaseSettings);
        conn.connect((err) => {
            if (err) { console.log(err.toString); res.write('Backend Error', () => { res.end(); conn.end(); }); }
            else conn.query(`SELECT DISTINCT year FROM ${mysqlConfig.gradesTable};`, (err, result1) => {
                if (err) { console.log(err.toString); res.write('Backend Error', () => { res.end(); conn.end(); }); }
                else conn.query(`SELECT DISTINCT departmentName FROM ${mysqlConfig.gradesTable};`, (err, result2) => {
                    if (err) { console.log(err.toString); res.write('Backend Error', () => res.end()); }
                    else {
                        responseCache['supported'] = {
                            years: Object.values(result1).map(e => e.year),
                            departments: Object.values(result2).map(e => e.departmentName),
                            syncing: syncing,
                            syncPercentage: syncPercentage
                        };
                        res.status(200).json(responseCache['supported']).end();
                    }
                    console.log(`[${date}.${time}] [${req.ip}] [${(result1.length+result2.length)>0?'SUCCESS':'FAILURE'} (Queried)] [GET ${req.url}]`);
                    conn.end();
                });
            });
        });
    }
});

app.get('/search', (req, res) => {
    const now = new Date();
    const date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
    const time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+':'+('0'+now.getSeconds()).slice(-2);
    const dep = mysql.escape(req.query['d'].replace(/[\W]+/g,'').toUpperCase().substring(0, 4));
    const course = mysql.escape(req.query['c'].replace(/[\W]+/g,'').toUpperCase().substring(0, 3));
    const queryString = dep+course;
    
    // check cache for response, if not, generate and store response
    if (!syncing && responseCache[queryString]) {
        res.status(200).json(responseCache[queryString]).end();
        console.log(`[${date}.${time}] [${req.ip}] [SUCCESS (Cached)] [GET ${req.url}]`);
    } else {
        const conn = mysql.createConnection(mysqlConfig.databaseSettings);
        const sqlQuery = (`SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM 
            ${mysqlConfig.gradesTable} WHERE (departmentName=${dep}) AND (course=${course});`);
        conn.connect((err) => {
            if (err) { console.log(err.toString); res.write('Backend Error', () => { res.end(); conn.end(); }); }
            else conn.query(sqlQuery, (err, result) => {
                if (err) { console.log(err.toString); res.write('Backend Error', () => res.end()); }
                else {
                    responseCache[queryString] = result;
                    res.status(200).json(responseCache[queryString]).end();
                }
                console.log(`[${date}.${time}] [${req.ip}] [${result.length>0?'SUCCESS':'FAILURE'} (Queried)] [GET ${req.url}]`);
                conn.end();
            });
        });
    }
});

app.use((req, res) => res.status(404).sendFile('public/404.html', { root: __dirname }));

app.listen(serverConfig.port, () => console.log(`Server running on port: ${serverConfig.port}`));

process.on('SIGINT', () => {
    console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
    process.exit(0);
});