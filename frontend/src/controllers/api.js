export const getAPI = async url => {
  const response = await fetch('/api' + url, {
    headers: {
      'X-Access-Token':
        'KzC4UDpipR5r7rQFYwHlt0ET0KNXVMGVGOhFquWQR9Oc736H9fTBEz56fqpGKKeF'
    }
  });
  return response.json();
};

export const parseId = fqName => {
  return fqName.split('#')[1];
};
