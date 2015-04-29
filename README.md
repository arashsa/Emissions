# NAROM eMission prototype

Browser rendered application written using React and the Flux architectural pattern. The development environment is based on a modified version of the boilerplate created by [Christian Alfoni](git@github.com:christianalfoni/react-app-boilerplate.git)

## Development
* Run `gulp`
* Start the Node server by executing `bin/www` or `node bin/www` from the root directory
* Go to `localhost:5000` to display the app
* Go to `localhost:5000/testrunner.html` to see your tests
* Any changes to `app` or `styles` folder will automatically rebuild to `build` folder
* Both tests and application changes will refresh automatically in the browser

### Minify the code, ready for production
* Run `gulp deploy`

This optimized result ends up in the `dist` directory. This will be used to serve users *given* that the
environment variable `NODE_ENV` has the value `"production"`. If you set up your own Heroku server you will need to set this environment value.

## Deploying to Heroku

The code has been living on [Heroku](http://herokuapp.com)'s cloud servers, and to get it there we need to
build the code before pushing it using Git. See Heroku's own docs for how to configure environment variables, etc.

### Push the code to the remote repo
* Run `git push heroku` (assumes Heroku has been set up)

## Verify the deploy went ok
* Run `heroku open` from the top level directory to open the project in the browser

## Directory
* **build/**: Where your automatic builds end up. These files are served by the node server in development mode.
* **dist/**: Where the deployed code exists, ready for production. Uses CDN versions of the code.
* **styles/**: Where you put your css files
* **specs/**: Where you put your test files
* **gulpfile**: Gulp configuration


# TODO
There are lots of things to do, and of course, a lot more than what I write here. But these are some obvious ones

- Create message queues for events. Currently messages are lost if the client is temporary offline (network issues) at the time they are sent out. Queue them up if they are not received.
- Merge the various chart code. Do it [the right way](http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app)
- Refactor state out of the various view components. Only watch Stores at the top level and pass info down
- Use the PureRender mixin or [shouldComponentUpdate](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) to avoid unneeded re-rendering.
- Less brittle routing. Routing and state logic is currently intertwined.
- Get an official domain name, pay for a real production server at Heroku, and set up a CloudFront CDN to speed up loading.
- Implement per-session authentication (MC has keys) to avoid kids ruining sessions by messing with other teams
- Concurrent multi-session support? If there only ever will be one session at a time (because Andøya needs physical personnel), there is no need for this.
- A log for the mission commander of what is happening at which time, and whether teams have accomplished this or that.
