import React from 'react';
import PropTypes from 'prop-types';

import { Segment as SUSegment, Header } from 'semantic-ui-react';

const Segment = props => {
  const { header, children } = props;

  return (
    <SUSegment color="blue">
      <Header as="h2"> {header} </Header>
      {children}
    </SUSegment>
  );
};

Segment.propTypes = {};

export default Segment;
