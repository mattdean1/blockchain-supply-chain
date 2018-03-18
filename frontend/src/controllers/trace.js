import { getAPI, parseId } from './api.js';

export const getBottleData = async bottleId => {
  const bottleData = await getAPI(`/biswas.filler.WineBottle/${bottleId}`);
  return bottleData;
};

export const getOwnershipHistory = async bottleId => {
  // get previous owners
  const transferBottle = await getAPI(
    `/biswas.distribution.transferBottle?filter=${encodeURIComponent(
      '{"where": {"wineBottle": "resource:biswas.filler.WineBottle#' +
        bottleId +
        '"}}'
    )}`
  );

  return transferBottle;
};

export const getOrigins = async bottleData => {
  const bottledWineId = bottleData.bottledWine.split('#')[1];
  const bottledWineData = await getAPI(
    `/biswas.filler.BottledWine/${bottledWineId}`
  );
  const bulkToBottled = await getAPI(
    `/biswas.base.transformBatch`,
    `{"where": {"batch": "${bottledWineData.bulkWine}"}}`
  );

  const bulkWineId = parseId(bottledWineData.bulkWine);
  const bulkWineData = await getAPI(`/biswas.producer.BulkWine/${bulkWineId}`);
  const grapesToBulk = await getAPI(
    `/biswas.base.transformBatch`,
    `{"where": {"batch": "${bulkWineData.grapes}"}}`
  );

  const grapesId = parseId(bulkWineData.grapes);
  const grapesData = await getAPI(`/biswas.grower.Grapes/${grapesId}`);

  return {
    bottledWineData,
    bulkToBottled: bulkToBottled[0],
    bulkWineData,
    grapesToBulk: grapesToBulk[0],
    grapesData
  };
};

export const trace = async bottleId => {
  const bottleData = await getBottleData(bottleId);
  const ownershipHistory = await getOwnershipHistory(bottleId);
  const origins = await getOrigins(bottleData);

  return [bottleData, ownershipHistory, origins];
};
