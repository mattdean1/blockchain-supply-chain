import React from 'react';
import PropTypes from 'prop-types';

import Segment from './Segment';
import { Segment as SUSegment } from 'semantic-ui-react';

import { parseId, parseDate } from '../controllers/api';

const Origins = props => {
  const { data } = props;
  if (data.length === 0) return null;

  return (
    <div>
      <Segment header="Origins">
        <SUSegment vertical>
          Wine bottled by {parseId(data.bottledWineData.filler)} on
          {parseDate(data.bulkToBottled.timestamp)}
        </SUSegment>
        <SUSegment vertical>
          Wine produced by {parseId(data.bulkWineData.producer)} on
          {parseDate(data.grapesToBulk.timestamp)}
        </SUSegment>
        <SUSegment vertical>
          Grapes harvested by {parseId(data.grapesData.grapeGrower)} on
          {parseDate(data.grapesData.harvestDate)}
        </SUSegment>
      </Segment>
    </div>
  );
};

Origins.propTypes = {};

export default Origins;
