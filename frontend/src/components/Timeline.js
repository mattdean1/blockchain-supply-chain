import React from 'react';

import { Step, Icon } from 'semantic-ui-react';

import { parseDate } from '../controllers/api';

const Timeline = props => {
  const { origins, history } = props;
  if (history.length === 0) return null;

  return (
    <div>
      <Step.Group fluid vertical style={{ textAlign: 'center' }}>
        <Step>
          <Icon name="dollar" />
          <Step.Content>
            <Step.Title>Sold to Consumer</Step.Title>
            <Step.Description>
              {parseDate(history[1].timestamp)}
            </Step.Description>
          </Step.Content>
        </Step>
        <Step>
          <Icon name="truck" />
          <Step.Content>
            <Step.Title>Sold to Retailer</Step.Title>
            <Step.Description>
              {parseDate(history[0][0].timestamp)}
            </Step.Description>
          </Step.Content>
        </Step>
        <Step>
          <Icon name="truck" />
          <Step.Content>
            <Step.Title>Sold to Distributor</Step.Title>
            <Step.Description>
              {parseDate(history[0][1].timestamp)}
            </Step.Description>
          </Step.Content>
        </Step>
        <Step>
          <Icon name="filter" />
          <Step.Content>
            <Step.Title>Bottled</Step.Title>
            <Step.Description>
              {parseDate(origins.bulkToBottled.timestamp)}
            </Step.Description>
          </Step.Content>
        </Step>

        <Step>
          <Icon name="theme" />
          <Step.Content>
            <Step.Title>Produced</Step.Title>
            <Step.Description>
              {parseDate(origins.grapesToBulk.timestamp)}
            </Step.Description>
          </Step.Content>
        </Step>
        <Step>
          <Icon name="leaf" />
          <Step.Content>
            <Step.Title>Harvested</Step.Title>
            <Step.Description>
              {parseDate(origins.grapesData.harvestDate)}
            </Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>
    </div>
  );
};

Timeline.propTypes = {};

export default Timeline;
