import React from 'react';

import { Header, Segment, Grid } from 'semantic-ui-react';

const BottleInfo = props => {
  const { data } = props;
  if (Object.values(data).length === 0) return null;

  return (
    <div>
      <Header as="h1">
        {data.year} {data.name}
      </Header>
      <Segment basic style={{ textAlign: 'left' }}>
        <Grid columns={3} style={{ fontSize: '1.1rem' }}>
          <Grid.Column />
          <Grid.Column>
            <Grid.Row>Strength: </Grid.Row>
            <Grid.Row>Additives: </Grid.Row>
          </Grid.Column>
          <Grid.Column>
            <Grid.Row>{data.alcoholPercentage}%</Grid.Row>
            <Grid.Row>None</Grid.Row>
          </Grid.Column>
        </Grid>
      </Segment>
    </div>
  );
};

BottleInfo.propTypes = {};

export default BottleInfo;
