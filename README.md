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
- [ ] Integrate webpack

## Getting Started

### Prerequisites

This project has two prerequisites.

The first is the [tamugd-parser](https://github.com/TAMU-GradeDistribution/tamugd-parser). This is required to generate the database tables that the website uses. Refer to the parser's README for information on this prerequisite.

The second one is [pnpm](https://pnpm.js.org/), this one is optional but highly recommended. It can be used in place of npm or yarn.
```bash
# if you don't have pnpm installed
$ npm install -g pnpm
```

### Installation
```bash
# clone the repo
$ git clone https://github.com/TAMU-GradeDistribution/tamugd-website

# install dependencies
$ pnpm install

# rename example_tamugd_config.js to tamugd_config.js
$ mv example_tamugd_config.js tamugd_config.js

# modify the values in tamugd_config.js to suit your environment
$ nano tamugd_config.js
```

## Usage
```bash
# to start the app
$ pnpm start
```

## License

This project is licensed under the **MIT license**.

See [LICENSE](./LICENSE) for more information.
