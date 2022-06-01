# TAMU-GradeDistribution-Website
This project is dedicated to helping analyze the massive amounts of data released every semester by Texas A&M University's Registrar's office.

---

## Features:
- Blazing fast loading times
- Server and client side caching
- Fully responsive design for desktop and mobile
- Presents a sleek, intuitive, and non-cramped interface
- Presents multiple *useful* forms of analysis for course data

## TODO:
- Automatically update the database when new data is released

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