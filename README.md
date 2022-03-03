# TAMU-GradeDistribution-Website
This project is dedicated to helping analyze the massive amounts of data released every semester by Texas A&M University's Registrar's office.

---

## Design goals:
 - Present a sleek, intuitive, non-cramped interface
 - Fully responsive site for desktop and mobile
 - Presents multiple *useful* forms of analysis for course data

## Roadmap:
- [x] <s>rewrite server with expressjs</s>
- [x] <s>http header hardening with helmetjs</s>
- [x] <s>responsive layout for desktop/mobile</s>
- [x] <s>add a dark theme and toggle switch</s>
- [x] <s>fully redo and optimize theming and css</s>
- [x] <s>optimize site loading time</s>
- [ ] optimize site javascript

## How to use:
1. Run [TAMU-GradeDistribution-ParserV2](https://github.com/TAMU-GradeDistribution/TAMU-GradeDistribution-ParserV2) to generate necessary database table
2. Rename example_mysql_config.js to mysql_config.js
3. Rename example_server_config.js to server_config.js
4. Open and modify the settings in both files to suit your environment
5. Then run the following npm commands:
    ```bash
    # install dependencies
    $ npm install

    # start server
    $ npm start
    ```

---
And you're done!