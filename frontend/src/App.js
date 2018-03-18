import React, { Component } from 'react';
import {
  getBottleData,
  getOwnershipHistory,
  getOrigins
} from './controllers/trace';

import { Grid, Header } from 'semantic-ui-react';
import BottleInfo from './components/BottleInfo';
import Timeline from './components/Timeline';
import Vineyard from './components/Vineyard';
import { SearchInput, NotFoundMessage } from './components/search';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      searchText: '',
      loading: false,
      bottleData: {},
      ownershipHistory: [],
      origins: [],
      couldNotFind: false
    };
  }

  handleChange = (e, data) => {
    this.setState({ searchText: data.value });
  };

  handleClick = async () => {
    const searchTerm = this.state.searchText;
    if (searchTerm === '') {
      return false;
    }

    this.setState({ loading: true, couldNotFind: false });
    const bottleId = searchTerm; // 'WINEBOTTLE_01521303744927';
    const bottleData = await getBottleData(bottleId);
    if (bottleData) {
      const ownershipHistory = await getOwnershipHistory(bottleId);
      const origins = await getOrigins(bottleData);
      this.setState({
        bottleData,
        ownershipHistory,
        origins,
        loading: false
      });
    } else {
      this.setState({ couldNotFind: true, loading: false });
    }
  };

  render() {
    const state = this.state;
    return (
      <div className="App">
        <Grid textAlign="center" style={{ height: '100%', margin: 0 }}>
          <Grid.Column>
            <Grid.Row textAlign="center" style={{ padding: '50px' }}>
              <Header as="h1" style={{ fontSize: '3rem' }}>
                Wine Tracker
              </Header>
            </Grid.Row>
            <Grid.Row>
              <SearchInput
                onChange={this.handleChange}
                onClick={this.handleClick}
                loading={this.state.loading}
              />
            </Grid.Row>
            <Grid.Row>
              <NotFoundMessage render={this.state.couldNotFind} />
            </Grid.Row>
            <Grid.Row>
              <Grid
                columns={8}
                stackable
                reversed="mobile"
                style={{ marginTop: '30px' }}
              >
                <Grid.Column width={2} />

                <Grid.Column width={5}>
                  <Timeline
                    history={state.ownershipHistory}
                    origins={state.origins}
                    style={{ margin: '10px auto' }}
                  />
                </Grid.Column>
                <Grid.Column width={1} />
                <Grid.Column width={7}>
                  <BottleInfo
                    data={state.bottleData}
                    style={{ margin: '10px auto' }}
                  />
                  <div />
                  <Vineyard data={state.origins} />
                </Grid.Column>
                <Grid.Column width={1} />
              </Grid>
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
