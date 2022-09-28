const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const mysql = require('mysql2');
const winston = require('winston'); require('winston-daily-rotate-file');
const config = require('./tamugd_config.js');

const logger = winston.createLogger({
    level: 'info',
    format: 
        winston.format.printf(({ level, message }) => {
            const now = new Date();
            const date = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
            const time = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+':'+('0'+now.getSeconds()).slice(-2);
            return `[${date}.${time}] ${message}`;
        }),
    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            level: 'info',
            dirname: 'logs/',
            filename: '%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '10d'
        }),
    ],
});

const app = express();
let responseCache = {};
let syncing = false;
let syncPercentage = '0';

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
    if (req.get['Referrer'] && req.get['Referrer'] != req.hostname) {
        const ip = ((req.get['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
        logger.info(`[${ip}] [Referrer: ${req.get['Referrer']}]`);
    }
    next();
});

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => res.status(200).sendFile(__dirname+'/public/img/favicon.ico'));

app.get('/supported', (req, res) => {
    const ip = ((req.get['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);

    // check if database is syncing, if so, clear cache
    {
        const conn = mysql.createConnection(config.databaseSettings);
        conn.connect((err) => {
            if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); conn.end(); }); }
            else {
                conn.query('SELECT * FROM '+config.statusTable+';', (err, result) => {
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

    // check cache for response, if not, generate and store response
    if (!syncing && responseCache['supported']) {
        res.status(200).json(responseCache['supported']).end();
        logger.info(`[${ip}] [✔️ Cached] [GET ${req.url}]`);
    } else {
        const conn = mysql.createConnection(config.databaseSettings);
        conn.connect((err) => {
            if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); conn.end(); }); }
            else conn.query(`SELECT DISTINCT year FROM ${config.gradesTable};`, (err, result1) => {
                if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); conn.end(); }); }
                else conn.query(`SELECT DISTINCT departmentName FROM ${config.gradesTable};`, (err, result2) => {
                    if (err) { logger.error(err); res.write('Backend Error', () => res.end()); }
                    else {
                        responseCache['supported'] = {
                            years: Object.values(result1).map(e => e.year),
                            departments: Object.values(result2).map(e => e.departmentName),
                            syncing: syncing,
                            syncPercentage: syncPercentage
                        };
                        res.status(200).json(responseCache['supported']).end();
                        logger.info(`[${ip}] [${(result1.length+result2.length)>0?'✔️':'❌'} Queried] [GET ${req.url}]`);
                    }
                    conn.end();
                });
            });
        });
    }
});

app.get('/search', (req, res) => {
    const ip = ((req.get['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
    
    if(req.query['d'] && req.query['c']) {
        const dep = mysql.escape(req.query['d'].replace(/[\W]+/g,'').toUpperCase().substring(0, 4));
        const course = mysql.escape(req.query['c'].replace(/[\W]+/g,'').toUpperCase().substring(0, 3));
        const queryString = dep+course;
        
        // check cache for response, if not, generate and store response
        if (!syncing && responseCache[queryString]) {
            res.status(200).json(responseCache[queryString]).end();
            logger.info(`[${ip}] [✔️ Cached] [GET ${req.url}]`);
        } else {
            const conn = mysql.createConnection(config.databaseSettings);
            const sqlQuery = (`SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM 
                ${config.gradesTable} WHERE (departmentName=${dep}) AND (course=${course});`);
            conn.connect((err) => {
                if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); conn.end();}); }
                else conn.query(sqlQuery, (err, result) => {
                    if (err) { logger.error(err); res.write('Backend Error', () => res.end()); }
                    else {
                        responseCache[queryString] = result;
                        res.status(200).json(responseCache[queryString]).end();
                    }
                    logger.info(`[${ip}] [${result.length>0?'✔️':'❌'} Queried] [GET ${req.url}]`);
                    conn.end();
                });
            });
        }
    } else {
        logger.info(`[${ip}] [❌ Missing Search Parameters] [GET ${req.url}]`);
        res.write('Frontend Error: Missing departmentName or course', () => res.end());
    }
});

app.use((req, res) => res.status(404).sendFile('public/404.html', { root: __dirname }));

app.listen(config.port, () => logger.info(`Server running on port: ${config.port}`));

process.on('SIGINT', () => {
    logger.info('Gracefully shutting down from SIGINT (Ctrl-C)\n');
    process.exit(0);
});