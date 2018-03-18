import React from 'react';

import { Message } from 'semantic-ui-react';

const NotFoundMessage = props => {
  if (!props.render) return null;

  return (
    <div
      style={{ marginTop: '30px', minWidth: '45%', display: 'inline-block' }}
    >
      <Message warning>
        <Message.Header>Bottle not found</Message.Header>
        <p>We couldn't find a bottle with that ID, please try again.</p>
      </Message>
    </div>
  );
};

NotFoundMessage.propTypes = {};

export default NotFoundMessage;
