'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('Producer', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'producerAdmin';
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

    describe('CreateWine()', () => {
        const grapesName = 'Grapes1';
        let events = [];

        beforeEach(async () => {
            const { grower, vineyard, producer } = await testUtils.setupParticipants(
                adminConnection,
                businessNetworkConnection
            );
            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create grapes
            const grapes = fac.newResource(constants.growerNamespace, 'Grapes', grapesName);
            grapes.quantity = 100;
            grapes.owner = fac.newRelationship(constants.producerNamespace, 'WineProducer', constants.producerName);
            grapes.grapeGrower = fac.newRelationship(constants.growerNamespace, 'GrapeGrower', constants.growerName);
            grapes.species = 'red';
            grapes.harvestDate = new Date(Date.now());
            grapes.vineyard = fac.newRelationship(constants.growerNamespace, 'Vineyard', constants.vineyardName);
            await utils.addAsset(businessNetworkConnection, constants.growerNamespace, 'Grapes', grapes);

            // submit tx
            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                constants.producerName
            );
            events = [];
            businessNetworkConnection.on('event', event => {
                events.push(event);
            });
            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            const createWine = fac.newTransaction(constants.producerNamespace, 'CreateWine');
            createWine.grapes = fac.newRelationship(constants.growerNamespace, 'Grapes', grapesName);
            await businessNetworkConnection.submitTransaction(createWine);
        });

        it('should add a bulkWine asset with the correct year', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bwRegistry.getAll();
            bw.length.should.equal(1);
            bw[0].year.should.equal(new Date(Date.now()).getFullYear());
        });

        it('should consume the grapes', async () => {
            const grapesRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.growerNamespace + '.Grapes'
            );
            const grapes = await grapesRegistry.get(grapesName);
            grapes.quantity.should.equal(0);
        });

        it('should emit a WineCreated event', async () => {
            events.length.should.equal(1);
            events[0].$type.should.equal('WineCreated');
        });

        it('should refer to the correct bulkWine in the event', async () => {
            const bwRegistry = await businessNetworkConnection.getAssetRegistry(
                constants.producerNamespace + '.BulkWine'
            );
            const bw = await bwRegistry.getAll();
            events[0].bulkWine.$identifier.should.equal(bw[0].$identifier);
        });
    });
});
