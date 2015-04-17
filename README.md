# NAROM eMission prototype

React app based on the structure set up by [Christian Alfoni](git@github.com:christianalfoni/react-app-boilerplate.git)

## Development
* Run `gulp`
* Start the Node server by executing `bin/www` or `node bin/www` from the root directory
* Go to `localhost:5000` to display the app
* Go to `localhost:5000/testrunner.html` to see your tests
* Any changes to `app` or `styles` folder will automatically rebuild to `build` folder
* Both tests and application changes will refresh automatically in the browser
* Run `gulp test` to run all tests with phantomJS and produce XML reports

### Minify the code, ready for production
* Run `gulp deploy`

This optimized result ends up in the `dist` directory. This will be used to serve users *given* that the
environment variable `NODE_ENV` has the value `"production"`.

## Deploying to Heroku

The code has been living on [Heroku](http://herokuapp.com)'s cloud servers, and to get it there we need to
build the code before pushing it using Git. See Heroku's own docs for how to configure environment variables, etc.

### Push the code to the remote repo
* Run `git push heroku`

## Verify the deploy went ok
* Run `heroku open` from the top level directory to open the project in the browser

## Directory
* **build/**: Where your automatically builds to. This is where you launch your app in development
* **dist/**: Where the deployed code exists, ready for production
* **styles/**: Where you put your css files
* **specs/**: Where you put your test files
* **gulpfile**: Gulp configuration