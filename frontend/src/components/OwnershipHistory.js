import React from 'react';
import PropTypes from 'prop-types';

import Segment from './Segment';

import { parseType, parseId, parseDate } from '../controllers/api';

const OwnershipHistory = props => {
  const { history } = props;
  if (history.length === 0) return null;

  const elems = history.map(h => {
    return (
      <p key={h.timestamp}>
        {parseType(h.newOwner)} {parseId(h.newOwner)} - Received
        {parseDate(h.timestamp)}
      </p>
    );
  });

  return (
    <div>
      <Segment header="Ownership History">{elems}</Segment>
    </div>
  );
};

OwnershipHistory.propTypes = {};

export default OwnershipHistory;
