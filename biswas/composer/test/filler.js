'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('Filler', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'fillerAdmin';
    const cardStore = NetworkCardStoreManager.getCardStore({
        type: 'composer-wallet-inmemory'
    });

    before(async () => {
        adminConnection = await testUtils.createAdminIdentity(cardStore, adminName);
    });

    beforeEach(async () => {
        await adminConnection.connect(adminName);
        businessNetworkConnection = await testUtils.deployNetwork(cardStore, adminConnection);
    });

    after(async () => {
        await testUtils.clearWallet(adminConnection);
        await adminConnection.disconnect();
    });

    describe('labelBottles()', () => {
        beforeEach(async () => {
            const { filler } = await testUtils.setupParticipants(adminConnection, businessNetworkConnection);
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            const owner = fac.newRelationship(constants.producerNamespace, 'WineProducer', constants.producerName);
            await testUtils.addGrapes(businessNetworkConnection, owner);
            await testUtils.addBulkWine(businessNetworkConnection, owner);
            await testUtils.addBottledWine(businessNetworkConnection);

            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.fillerName
            );

            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            let tx = fac.newTransaction(constants.fillerNamespace, 'labelBottles');
            tx.bottledWine = fac.newRelationship(constants.fillerNamespace, 'BottledWine', constants.bottledWineName);
            await businessNetworkConnection.submitTransaction(tx);
        });

        it('should create the correct number of bottles', async () => {
            const bottleRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.fillerNamespace + '.WineBottle'
            );
            const wineBottles = await bottleRegistry.getAll();
            wineBottles.length.should.equal(constants.bottledWineQuantity);
        });
        it('should specify the correct owner for the new bottles', async () => {
            const bottleRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.fillerNamespace + '.WineBottle'
            );
            const wineBottles = await bottleRegistry.getAll();
            wineBottles[0].owner.$identifier.should.equal(constants.fillerName);
        });
        it('should consume the BottledWine', async () => {
            const wineRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.fillerNamespace + '.BottledWine'
            );
            const bottledWine = await wineRegistry.get(constants.bottledWineName);
            bottledWine.quantity.should.equal(0);
        });
    });
});
