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
  const earliestTx = transferBottle[transferBottle.length - 1].transactionId;
  const prevOwner = await getAPI(`/system/historian/${earliestTx}`);

  return [transferBottle, prevOwner];
};

export const getOrigins = async bottleData => {
  const bottledWineId = bottleData.bottledWine.split('#')[1];
  const bottledWineData = await getAPI(
    `/biswas.filler.BottledWine/${bottledWineId}`
  );

  const bulkWineId = parseId(bottledWineData.bulkWine);
  const bulkWineData = await getAPI(`/biswas.producer.BulkWine/${bulkWineId}`);

  const grapesId = parseId(bulkWineData.grapes);
  const grapesData = await getAPI(`/biswas.grower.Grapes/${grapesId}`);

  return [bottledWineData, bulkWineData, grapesData];
};

export const trace = async bottleId => {
  const bottleData = await getBottleData(bottleId);
  const ownershipHistory = await getOwnershipHistory(bottleId);
  const origins = await getOrigins(bottleData);

  return [bottleData, ownershipHistory, origins];
};
