# NAROM eMission prototype

React app based on the structure set up by  git@github.com:christianalfoni/react-app-boilerplate.git

## Development
* Run `gulp`
* Start a webservice in the `build` folder, f.ex. `python -m SimpleHTTPServer`
* Go to `localhost:5000` to display the app
* Go to `localhost:5000/testrunner.html` to see your tests
* Any changes to `app` or `styles` folder will automatically rebuild to `build` folder
* Both tests and application changes will refresh automatically in the browser
* Run `gulp test` to run all tests with phantomJS and produce XML reports

## Deploying to heroku

The code lives on Heroku's cloud servers and we need to build the code before pushing it.

### Minify the code, ready for production
* Run `NODE_ENV=production gulp deploy`
Ends up in the `dist` that is served to the end users on Heroku

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