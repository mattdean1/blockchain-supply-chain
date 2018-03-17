'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('Distribution', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'distributionAdmin';
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

    describe('sellBottle()', () => {
        beforeEach(async () => {
            const retailer = await utils.addUsableParticipant(
                adminConnection,
                businessNetworkConnection,
                'biswas.distribution',
                'Retailer',
                'retailer',
                {
                    email: 'string@retailer.com'
                }
            );

            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            const bottle = fac.newResource('biswas.filler', 'WineBottle', 'bottle1');
            bottle.alcoholPercentage = 10;
            bottle.year = 2018;
            bottle.name = 'Pinot Grigio';
            bottle.quantity = 1;
            bottle.owner = fac.newRelationship('biswas.distribution', 'Retailer', retailer.$identifier);
            bottle.bottledWine = fac.newRelationship('biswas.filler', 'BottledWine', 'bottledWine1');
            await utils.addAsset(businessNetworkConnection, 'biswas.filler', 'WineBottle', bottle);

            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                retailer.$identifier
            );

            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            let tx = fac.newTransaction('biswas.distribution', 'sellBottle');
            tx.wineBottle = fac.newRelationship(constants.fillerNamespace, 'WineBottle', bottle.$identifier);
            await businessNetworkConnection.submitTransaction(tx);
        });

        it('should reduce the quantity to zero', async () => {
            const bottleRegistry = await businessNetworkConnection.getAssetRegistry('biswas.filler.WineBottle');
            const bottles = await bottleRegistry.getAll();
            bottles[0].quantity.should.equal(0);
        });
    });

    describe('transferBottle()', () => {
        beforeEach(async () => {
            const distributor = await utils.addUsableParticipant(
                adminConnection,
                businessNetworkConnection,
                'biswas.distribution',
                'Distributor',
                'distributor',
                {
                    email: 'string@distributor.com'
                }
            );

            const retailer = await utils.addUsableParticipant(
                adminConnection,
                businessNetworkConnection,
                'biswas.distribution',
                'Retailer',
                'retailer',
                {
                    email: 'string@retailer.com'
                }
            );

            let fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            const bottle = fac.newResource('biswas.filler', 'WineBottle', 'bottle1');
            bottle.alcoholPercentage = 10;
            bottle.year = 2018;
            bottle.name = 'Pinot Grigio';
            bottle.quantity = 1;
            bottle.owner = fac.newRelationship('biswas.distribution', 'Distributor', distributor.$identifier);
            bottle.bottledWine = fac.newRelationship('biswas.filler', 'BottledWine', 'bottledWine1');
            await utils.addAsset(businessNetworkConnection, 'biswas.filler', 'WineBottle', bottle);

            businessNetworkConnection = await utils.connectParticipant(
                businessNetworkConnection,
                cardStore,
                distributor.$identifier
            );

            fac = businessNetworkConnection.getBusinessNetwork().getFactory();
            let tx = fac.newTransaction('biswas.distribution', 'transferBottle');
            tx.wineBottle = fac.newRelationship(constants.fillerNamespace, 'WineBottle', bottle.$identifier);
            tx.newOwner = fac.newRelationship('biswas.distribution', 'Retailer', retailer.$identifier);
            await businessNetworkConnection.submitTransaction(tx);
        });

        it('should change the owner of the bottle', async () => {
            const bottleRegistry = await businessNetworkConnection.getAssetRegistry('biswas.filler.WineBottle');
            const bottles = await bottleRegistry.getAll();
            bottles[0].owner.$identifier.should.equal('retailer');
        });
    });
});
