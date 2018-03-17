import React, { Component } from 'react';

import { Grid, Header, Input, Button } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

const getAPI = async url => {
  const response = await fetch(url, {
    headers: {
      'X-Access-Token':
        'KzC4UDpipR5r7rQFYwHlt0ET0KNXVMGVGOhFquWQR9Oc736H9fTBEz56fqpGKKeF'
    }
  });
  return response.json();
};

const trace = async id => {
  const json = await getAPI(`/api/biswas.filler.WineBottle/${id}`);
  return [json];
};

const renderTraceInfo = info => {
  if (info.length === 0) return null;
  return (
    <pre style={{ width: '60%', textAlign: 'left', margin: '30px auto' }}>
      {JSON.stringify(info, null, 2)}
    </pre>
  );
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      searchText: '',
      trace: [],
      info: []
    };
  }

  handleChange = (e, data) => {
    this.setState({ searchText: data.value });
  };

  handleClick = async () => {
    console.log(this.state.searchText);
    const info = await trace('WINEBOTTLE_01521303744927'); // trace(this.state.searchText)
    this.setState({
      info
    });
  };

  render() {
    return (
      <div className="App">
        <Grid textAlign="center" style={{ height: '100%' }}>
          <Grid.Column>
            <Grid.Row textAlign="center" style={{ padding: '50px' }}>
              <Header as="h1" style={{ fontSize: '3rem' }}>
                Wine Tracker
              </Header>
            </Grid.Row>
            <Grid.Row textAlign="center">
              <Input
                placeholder="Search here"
                onChange={this.handleChange}
                action={{
                  color: 'blue',
                  content: 'Search',
                  size: 'huge',
                  onClick: this.handleClick
                }}
                style={{ fontSize: '1.5rem', width: '45%' }}
              />
            </Grid.Row>
            <Grid.Row>{renderTraceInfo(this.state.info)}</Grid.Row>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
