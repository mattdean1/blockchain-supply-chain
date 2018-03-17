import React from 'react';
import PropTypes from 'prop-types';

import Segment from './Segment';

const Origins = props => {
  const { data } = props;
  if (data.length === 0) return null;

  return (
    <div>
      <Segment header="Origins">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Segment>
    </div>
  );
};

Origins.propTypes = {};

export default Origins;
