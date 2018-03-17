import React from 'react';
import PropTypes from 'prop-types';

import Segment from './Segment';

const BottleInfo = props => {
  const { data } = props;
  if (Object.values(data).length === 0) return null;

  return (
    <div>
      <Segment header="Bottle Information">
        <p>Name: {data.name}</p>
        <p>Year: {data.year}</p>
        <p>Alcohol: {data.alcoholPercentage}%</p>
      </Segment>
    </div>
  );
};

BottleInfo.propTypes = {};

export default BottleInfo;
