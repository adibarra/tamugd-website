# tamugd-website
This project is dedicated to helping analyze the massive amounts of data released every semester by Texas A&M University's Registrar's office.

---

## Features:
- Blazing fast loading times
- Server and client side caching
- Fully responsive design for desktop and mobile
- Presents a sleek, intuitive, and non-cramped UI/UX
- Presents multiple *useful* forms of analysis for course data

## TODO:
- [ ] Automatically update the database when new data is released
- [ ] Add a way of sharing links

## How to use:
1. Run [tamugd-parser](https://github.com/TAMU-GradeDistribution/tamugd-parser) to generate necessary database tables
2. Rename example_tamugd_config.js to tamugd_config.js
3. Modify the values in tamugd_config.js to suit your environment
4. Then run the following yarn commands:
    ```bash
    # install dependencies
    $ yarn install

    # start server
    $ yarn start
    ```

---
And you're done!