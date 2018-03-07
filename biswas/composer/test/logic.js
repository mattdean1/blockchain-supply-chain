'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('./test-utils.js');

const growerNamespace = 'biswas.grower';
const producerNamespace = 'biswas.producer';
const assetType = 'Grapes';

describe('test', () => {
    let adminConnection;
    const adminName = 'testAdmin';
    const cardStore = NetworkCardStoreManager.getCardStore({
        type: 'composer-wallet-inmemory'
    });

    before(async () => {
        adminConnection = await testUtils.createAdminIdentity(cardStore, adminName);
    });

    describe(growerNamespace, () => {
        let businessNetworkConnection;

        beforeEach(async () => {
            await adminConnection.connect(adminName);
            businessNetworkConnection = await testUtils.deployNetwork(cardStore, adminConnection);
        });

        after(async () => {
            await testUtils.clearWallet(adminConnection);
            await adminConnection.disconnect();
        });

        describe('SellGrapes()', () => {
            const growerName = 'Grower1';
            const producerName = 'Producer1';
            const grapesName = 'Grapes1';

            beforeEach(async () => {
                let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

                const vineyard = fac.newResource(growerNamespace, 'Vineyard', 'vyard_001');
                vineyard.altitude = 100;
                vineyard.location = fac.newConcept(growerNamespace, 'Location');
                vineyard.location.latitude = 0.0;
                vineyard.location.longitude = 0.0;
                await utils.addAsset(businessNetworkConnection, growerNamespace, 'Vineyard', vineyard);

                const grower = await utils.addUsableParticipant(
                    adminConnection,
                    businessNetworkConnection,
                    growerNamespace,
                    'GrapeGrower',
                    growerName,
                    {
                        email: 'string@grower.com',
                        vineyards: [vineyard]
                    }
                );

                const producer = await utils.addUsableParticipant(
                    adminConnection,
                    businessNetworkConnection,
                    producerNamespace,
                    'WineProducer',
                    producerName,
                    {
                        email: 'string@producer.com'
                    }
                );

                try {
                    const grapes = fac.newResource(growerNamespace, 'Grapes', grapesName);
                    grapes.quantity = 100;
                    const growerRelation = fac.newRelationship(growerNamespace, 'GrapeGrower', grower.$identifier);
                    grapes.owner = growerRelation;
                    grapes.grapeGrower = growerRelation;
                    grapes.species = 'red';
                    grapes.harvestDate = new Date(Date.now()); //.toISOString()
                    grapes.vineyard = fac.newRelationship(growerNamespace, 'Vineyard', vineyard.$identifier);
                    await utils.addAsset(businessNetworkConnection, growerNamespace, 'Grapes', grapes);
                } catch (e) {
                    throw new Error('asdf' + e);
                }
            });

            it('should decrease the quantity of the original grapes', async () => {
                businessNetworkConnection = await utils.connectParticipant(
                    businessNetworkConnection,
                    cardStore,
                    growerName
                );
                const fac = businessNetworkConnection.getBusinessNetwork().getFactory();

                const sellGrapes = fac.newTransaction(growerNamespace, 'SellGrapes');
                sellGrapes.quantity = 45;
                sellGrapes.grapes = fac.newRelationship(growerNamespace, 'Grapes', grapesName);
                sellGrapes.buyer = fac.newRelationship(producerNamespace, 'WineProducer', 'producer');

                return businessNetworkConnection
                    .submitTransaction(sellGrapes)
                    .then(() => {
                        return businessNetworkConnection.getAssetRegistry(growerNamespace + '.Grapes');
                    })
                    .then(grapesRegistry => {
                        // Get the asset
                        return grapesRegistry.get(grapesName);
                    })
                    .then(grapes => {
                        // Assert that the asset has the new value property
                        grapes.quantity.should.equal(55);
                    });
            });
        });
    });
});
