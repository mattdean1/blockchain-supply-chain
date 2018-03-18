import React from 'react';

import { Input } from 'semantic-ui-react';

const SearchInput = props => {
  return (
    <Input
      placeholder="Search here"
      onChange={props.onChange}
      action={{
        color: 'blue',
        content: 'Search',
        size: 'big',
        onClick: props.onClick
      }}
      icon="search"
      iconPosition="left"
      loading={props.loading}
      style={{ fontSize: '18px', minWidth: '45%' }}
    />
  );
};

SearchInput.propTypes = {};

export default SearchInput;
