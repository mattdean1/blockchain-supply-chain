import React from 'react';
import PropTypes from 'prop-types';

import Segment from './Segment';

const OwnershipHistory = props => {
  const { history } = props;
  if (history.length === 0) return null;
  console.log(history);

  const transferBottle = history[0];
  const historian = history[1];

  let parsedHistory = transferBottle.map(tx => {
    return { owner: tx.newOwner, timestamp: tx.timestamp };
  });

  const elems = parsedHistory.map(h => {
    return (
      <p key={h.timestamp}>
        {' '}
        Owner: {h.owner} - Recieved {h.timestamp}
      </p>
    );
  });

  return (
    <div>
      <Segment header="Ownership History">
        {elems}
        <p>Filler: {historian.participantInvoking}</p>
      </Segment>
    </div>
  );
};

OwnershipHistory.propTypes = {};

export default OwnershipHistory;
