import React from 'react';

import AgileGatheringHost from './components/AgileGatheringHost.react.js';
import bootstrap from './vendor/bootstrap.min.css';
import styles from './common.css';

let App = React.createClass({
    render() {
        return (<div className="container-fluid" style={{marginRight:"25px", marginLeft:"25px", maxHeight:"1024px"}}>
                    <div className="header clearfix">
                        <h3 className="text-muted" style={{marginLeft: "auto", marginRight: "auto", width: "250px"}}>Agile: The Gathering</h3>
                        <AgileGatheringHost/>
                    </div>
                </div>
            );
    }
});

React.render(<App/>, document.body);