import { getAPI, parseId } from './api.js';

export const getBottleData = async bottleId => {
  const bottleData = await getAPI(`/biswas.filler.WineBottle/${bottleId}`);
  return bottleData.error && bottleData.error.status === 404
    ? false
    : bottleData;
};

export const getOwnershipHistory = async bottleId => {
  const fqBottleId = `resource:biswas.filler.WineBottle#${bottleId}`;
  // get previous owners
  const transferBottle = await getAPI(
    `/biswas.distribution.transferBottle`,
    `{"where": {"wineBottle": "${fqBottleId}"}}`
  );

  // get sale to consumer
  const sellBottle = await getAPI(
    `/biswas.distribution.sellBottle`,
    `{"where": {"wineBottle": "${fqBottleId}"}}`
  );

  return [transferBottle, sellBottle[0]];
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
  const vineyard = await getAPI(
    `/biswas.grower.Vineyard/${parseId(grapesData.vineyard)}`
  );

  return {
    bottledWineData,
    bulkToBottled: bulkToBottled[0],
    bulkWineData,
    grapesToBulk: grapesToBulk[0],
    grapesData,
    vineyard
  };
};

export const trace = async bottleId => {
  const bottleData = await getBottleData(bottleId);
  const ownershipHistory = await getOwnershipHistory(bottleId);
  const origins = await getOrigins(bottleData);

  return [bottleData, ownershipHistory, origins];
};
