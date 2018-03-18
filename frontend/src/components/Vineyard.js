import React, { Component } from 'react';

import { Accordion, Icon, Header, Grid } from 'semantic-ui-react';
import Map from './Map';

import { parseId } from '../controllers/api';

class Vineyard extends Component {
  state = { open: true };

  handleClick = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  };

  render() {
    const { data } = this.props;
    if (data.length === 0) return null;

    return (
      <div style={{ marginTop: '20px' }}>
        <Accordion>
          <Accordion.Title
            active={this.state.open}
            index={0}
            onClick={this.handleClick}
          >
            <Header as="h1">
              <Icon name="dropdown" />
              Grown at {parseId(data.grapesData.vineyard)}
            </Header>
          </Accordion.Title>
          <Accordion.Content
            active={this.state.open}
            style={{ textAlign: 'left' }}
          >
            <Grid columns={3} style={{ fontSize: '1.1rem' }}>
              <Grid.Column />
              <Grid.Column>
                <Grid.Row>Altitude:</Grid.Row>
                <Grid.Row>Region: </Grid.Row>
                <Grid.Row>Grape: </Grid.Row>
              </Grid.Column>
              <Grid.Column>
                <Grid.Row>{data.vineyard.altitude}m</Grid.Row>
                <Grid.Row>{data.vineyard.region}</Grid.Row>
                <Grid.Row>{data.grapesData.species}</Grid.Row>
              </Grid.Column>
            </Grid>
            <Map
              location={[
                data.vineyard.location.latitude,
                data.vineyard.location.longitude
              ]}
            />
          </Accordion.Content>
        </Accordion>
      </div>
    );
  }
}

Vineyard.propTypes = {};

export default Vineyard;
