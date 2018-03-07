'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

const growerNamespace = 'biswas.grower';
const producerNamespace = 'biswas.producer';
const assetType = 'Grapes';

describe('Grower', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'growerAdmin';
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

    describe('SellGrapes()', () => {
        const grapesName = 'Grapes1';

        beforeEach(async () => {
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            const { grower, vineyard, producer } = await testUtils.setupParticipants(
                adminConnection,
                businessNetworkConnection
            );

            const grapes = fac.newResource(growerNamespace, 'Grapes', grapesName);
            grapes.quantity = 100;
            const growerRelation = fac.newRelationship(growerNamespace, 'GrapeGrower', grower.$identifier);
            grapes.owner = growerRelation;
            grapes.grapeGrower = growerRelation;
            grapes.species = 'red';
            grapes.harvestDate = new Date(Date.now()); //.toISOString()
            grapes.vineyard = fac.newRelationship(growerNamespace, 'Vineyard', vineyard.$identifier);
            await utils.addAsset(businessNetworkConnection, growerNamespace, 'Grapes', grapes);

            // Submit tx
            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.growerName
            );
            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            const sellGrapes = fac.newTransaction(growerNamespace, 'SellGrapes');
            sellGrapes.quantity = 45;
            sellGrapes.grapes = fac.newRelationship(growerNamespace, 'Grapes', grapesName);
            sellGrapes.buyer = fac.newRelationship(producerNamespace, 'WineProducer', constants.producerName);
            await businessNetworkConnection.submitTransaction(sellGrapes);
        });

        it('should decrease the quantity of the original grapes', async () => {
            const grapesRegistry = await businessNetworkConnection.getAssetRegistry(growerNamespace + '.Grapes');
            const grapes = await grapesRegistry.get(grapesName);
            grapes.quantity.should.equal(55);
        });
        it('should create a new batch for the new owner with the correct quantity', async () => {
            const grapesRegistry = await businessNetworkConnection.getAssetRegistry(growerNamespace + '.Grapes');
            const grapes = await grapesRegistry.getAll();
            const newOwnerGrapes = grapes.filter(g => g.owner.$identifier === constants.producerName);
            newOwnerGrapes.length.should.equal(1);
            newOwnerGrapes[0].quantity.should.equal(45);
        });
    });
});
