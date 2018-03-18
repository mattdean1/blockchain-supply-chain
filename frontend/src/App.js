import React, { Component } from 'react';
import {
  getBottleData,
  getOwnershipHistory,
  getOrigins
} from './controllers/trace';

import { Grid, Header, Input, Button } from 'semantic-ui-react';
import BottleInfo from './components/BottleInfo';
import OwnershipHistory from './components/OwnershipHistory';
import Origins from './components/Origins';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      searchText: '',
      bottleData: {},
      ownershipHistory: [],
      origins: []
    };
  }

  handleChange = (e, data) => {
    this.setState({ searchText: data.value });
  };

  handleClick = async () => {
    const bottleId = 'WINEBOTTLE_01521303744927'; // this.state.searchText
    const bottleData = await getBottleData(bottleId);
    const ownershipHistory = await getOwnershipHistory(bottleId);
    const origins = await getOrigins(bottleData);
    this.setState({
      bottleData,
      ownershipHistory,
      origins
    });
  };

  render() {
    const state = this.state;
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
            <Grid.Row style={{ width: '50%', margin: '0 auto' }}>
              <BottleInfo
                data={state.bottleData}
                style={{ margin: '10px auto' }}
              />
              <OwnershipHistory
                history={state.ownershipHistory}
                style={{ margin: '10px auto' }}
              />
              <Origins data={state.origins} />
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
