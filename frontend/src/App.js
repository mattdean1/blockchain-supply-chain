import React, { Component } from 'react';

import { Grid, Header, Input, Button } from 'semantic-ui-react';

import logo from './logo.svg';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      searchText: '',
      trace: []
    };
  }

  handleChange = (e, data) => {
    console.log(data);
    this.setState({ searchText: data.value });
  };

  handleClick = () => {
    console.log(this.state.searchText);
  };

  render() {
    return (
      <div className="App">
        <Grid centred verticalAlign="middle" style={{ height: '100%' }}>
          <Grid.Column>
            <Grid.Row style={{ padding: '50px' }}>
              <Header as="h1" style={{ fontSize: '3rem' }}>
                Wine Tracker
              </Header>
            </Grid.Row>
            <Grid.Row>
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
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
