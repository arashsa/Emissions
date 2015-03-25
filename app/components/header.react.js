const React = require('react');
const Router = require('react-router');
const Link = Router.Link;

var Header = React.createClass({

    render() {
        return (
            <div>
                <div className='row'>

                    <header id='narom-header' >
                        <div>
                            <img className = 'narom-logo-img'  src='/images/logo.png' />
                            NAROM e-Mission prototype
                        </div>
                    </header>
                </div>

                <div id='main-header' className='row' >
                    <Link to='/' >
                        <header >
                            <h1 className = ''>Under en solstorm</h1>
                        </header>
                    </Link>
                </div>

            </div>
        );
    }
});

module.exports = Header;