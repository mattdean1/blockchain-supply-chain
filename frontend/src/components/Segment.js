import React from 'react';
import PropTypes from 'prop-types';

import { Segment as SUSegment, Header } from 'semantic-ui-react';

const Segment = props => {
  const { header, children } = props;

  return (
    <div>
      <SUSegment color="blue" style={{ margin: '20px auto' }}>
        <Header as="h2"> {header} </Header>
        {children}
      </SUSegment>
    </div>
  );
};

Segment.propTypes = {};

export default Segment;
