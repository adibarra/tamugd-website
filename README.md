# TAMU-GradeDistribution-Website
The goal of this project is to create a website which is capable of creating visualizations for the grade distribution reports published by Texas A&M University's Registrar's office.

---

## Design goals:
 - Present a sleek, intuitive, non-cramped interface
 - Fully compatible with mobile devices
 - Presents multiple *useful* forms of analysis for course data

## TODO:
- [x] http header hardening
- [x] rewrite server with expressjs
- [x] use media queries to modify layout to fit better on mobile devices
- [x] add a dark theme
- [x] add a toggle switch for dark theme
- [x] add ratelimiting 60/min
- [ ] rewrite getChartData function
- [ ] generate chart colors using rules (maybe https://github.com/c0bra/color-scheme-js)

## How to use:
1. Run [TAMU-GradeDistribution-ParserV2](https://github.com/TAMU-GradeDistribution/TAMU-GradeDistribution-ParserV2) to generate necessary database table
2. Rename example_mysql_config.js to mysql_config.js
3. Rename example_server_config.js to server_config.js
4. Open and modify the settings in both files to suit your environment
5. Then run the following npm commands:
    ```
    # install dependencies
    $ npm install

    # start server
    $ npm start
    ```


---
And you're done!