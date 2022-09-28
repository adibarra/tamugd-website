const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const mysql2 = require('mysql2');
const winston = require('winston'); require('winston-daily-rotate-file');
const config = require('./tamugd_config.js');

// create logger
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
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '10d'
        }),
    ],
});

// create express instance
const app = express();
let RESPONSE_CACHE = {};

// trust one layer of proxies (cloudflare)
app.set('trust proxy', 1);
app.use(compression());

// configure helmetjs for header hardening
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
        }
    }
}));

// get referer if available
app.use('/', (req, res, next) => {
    const ip = ((req.headers['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
    if (req.get('Referer')) logger.info(`[${ip}] [Refered By: ${req.get('Referer')}]`);
    next();
});

// set ./public as root directory
app.use(express.static('public'));

// set /favicon.ico as an alias to actual location
app.get('/favicon.ico', (req, res) => res.status(200).sendFile(__dirname+'/public/img/favicon.ico'));

// return information about the grade data in the database and database building progress
app.get('/supported', (req, res) => {
    const ip = ((req.headers['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
    let buildPercentage = '0';

    { // check if database is building, if so, clear cache
        const conn = mysql2.createConnection(config.databaseSettings);
        conn.query('SELECT * FROM '+config.statusTable+';', (err, result) => {
            if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); }); }
            else if (result && result.length > 0) buildPercentage = result[0].value;
        });
        if (buildPercentage !== '100') RESPONSE_CACHE = {};
    }

    // check cache for response, if not, generate and store response
    if (RESPONSE_CACHE['supported']) {
        res.status(200).json(RESPONSE_CACHE['supported']).end();
        logger.info(`[${ip}] [✔️ Cached] [GET ${req.url}]`);
    } else {
        const conn = mysql2.createConnection(config.databaseSettings);
        conn.query(`SELECT DISTINCT year FROM ${config.gradesTable};`, (err, result1) => {
            if (err) { logger.error(err); res.write('Backend Error', () => { res.end(); }); }
            else conn.query(`SELECT DISTINCT departmentName FROM ${config.gradesTable};`, (err, result2) => {
                if (err) { logger.error(err); res.write('Backend Error', () => res.end()); }
                else {
                    RESPONSE_CACHE['supported'] = {
                        years: Object.values(result1).map(e => e.year),
                        departments: Object.values(result2).map(e => e.departmentName),
                        buildPercentage: buildPercentage
                    };
                    res.status(200).json(RESPONSE_CACHE['supported']).end();
                }
                logger.info(`[${ip}] [${(result1.length+result2.length)>0?'✔️':'❌'} Queried] [GET ${req.url}]`);
            });
        });
    }
});

// return information about queried course
app.get('/search', (req, res) => {
    const ip = ((req.headers['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
    
    if(req.query['d'] && req.query['c']) {
        const dep = mysql2.escape(req.query['d'].replace(/[\W]+/g,'').toUpperCase().substring(0, 4));
        const course = mysql2.escape(req.query['c'].replace(/[\W]+/g,'').toUpperCase().substring(0, 3));
        const queryString = dep+course;
        
        // check cache for response, if not, generate and store response
        if (RESPONSE_CACHE[queryString]) {
            res.status(200).json(RESPONSE_CACHE[queryString]).end();
            logger.info(`[${ip}] [✔️ Cached] [GET ${req.url}]`);
        } else {
            const conn = mysql2.createConnection(config.databaseSettings);
            const sqlQuery = (`SELECT year,semester,professorName,section,honors,avgGPA,numA,numB,numC,numD,numF,numI,numS,numU,numQ,numX FROM 
                ${config.gradesTable} WHERE (departmentName=${dep}) AND (course=${course});`);
            conn.connect((err) => {
                if (err) { logger.error(err); res.write('Backend Error', () => { res.end();}); }
                else conn.query(sqlQuery, (err, result) => {
                    if (err) { logger.error(err); res.write('Backend Error', () => res.end()); }
                    else {
                        RESPONSE_CACHE[queryString] = result;
                        res.status(200).json(RESPONSE_CACHE[queryString]).end();
                    }
                    logger.info(`[${ip}] [${result.length>0?'✔️':'❌'} Queried] [GET ${req.url}]`);
                });
            });
        }
    } else {
        logger.info(`[${ip}] [❌ Missing Search Parameters] [GET ${req.url}]`);
        res.write('Frontend Error: Missing departmentName or course', () => res.end());
    }
});

// default all other requests to the 404 page
app.use((req, res) => {
    res.status(404).sendFile('public/404.html', { root: __dirname });
    const ip = ((req.headers['cf-connecting-ip'] || req.ip)+'        ').slice(0,15);
    logger.info(`[${ip}] [❌ 404] [GET ${req.url}]`);
});

// start the server
app.listen(config.port, () => logger.info(`Server running on port: ${config.port}`));

// handle sigint
process.on('SIGINT', () => {
    logger.info('Gracefully shutting down from SIGINT (Ctrl-C)\n');
    process.exit(0);
});