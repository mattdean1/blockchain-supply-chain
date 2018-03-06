'use strict';

/**
 * Write the unit tests for your transction processor functions here
 */

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

describe(growerNamespace, () => {
    const cardStore = NetworkCardStoreManager.getCardStore({ type: 'composer-wallet-inmemory' });
    let adminConnection;
    let businessNetworkConnection;

    before(async () => {
        adminConnection = await testUtils.createAdminIdentity1(cardStore);
    });

    beforeEach(async () => {
        businessNetworkConnection = await testUtils.deployNetwork1(cardStore, adminConnection);
    });

    describe('utils', () => {
        describe('Connecting to the network', () => {
            describe('connectAdmin', () => {
                it('should ping network successfully using admin card', async () => {
                    await utils.connectAdmin(businessNetworkConnection);
                    return businessNetworkConnection.ping();
                });
            });
            describe('connectParticipant', () => {
                it('should ping network successfully using participant card', async () => {
                    businessNetworkConnection = await utils.connectParticipant(
                        businessNetworkConnection,
                        cardStore,
                        'admin@biswas'
                    );
                    return businessNetworkConnection.ping();
                });
            });
        });

        describe('Creating new participants', () => {
            describe('addParticipant', () => {
                it('should add a participant to the registry', async () => {
                    const namespace = 'biswas.grower';
                    const type = 'GrapeGrower';
                    const id = 'grower1';

                    const participant = await utils.addParticipant(businessNetworkConnection, namespace, type, id, {
                        email: 'asdf',
                        vineyards: []
                    });

                    let participantRegistry = await businessNetworkConnection.getParticipantRegistry(
                        namespace + '.' + type
                    );
                    const gotParticipant = await participantRegistry.exists(id);
                    gotParticipant.should.equal(true);
                });
            });
            describe('createIdCard', () => {
                it('should create and import an ID card', async () => {
                    const cardName = 'testuser';
                    await utils.createIdCard(
                        adminConnection,
                        { userID: 'user', enrollmentSecret: 'secret1' },
                        cardName
                    );

                    const cardExists = await adminConnection.hasCard(cardName);
                    cardExists.should.equal(true);
                });
            });
            describe('addUsableParticipant', () => {
                it('should create a participant that is able to ping the network successfully', async () => {
                    const username = 'grower2';
                    await utils.addUsableParticipant(
                        adminConnection,
                        businessNetworkConnection,
                        'biswas.grower',
                        'GrapeGrower',
                        username,
                        { email: 'asdf', vineyards: [] }
                    );
                    businessNetworkConnection = await utils.connectParticipant(
                        businessNetworkConnection,
                        cardStore,
                        username
                    );
                    return businessNetworkConnection.ping();
                });
            });
        });
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
