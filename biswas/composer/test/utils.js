'use strict';

require('chai').should();

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const utils = require('../src/utils');
const testUtils = require('./test-utils');

describe('Utils', () => {
    let adminConnection;
    let businessNetworkConnection;
    const cardStore = NetworkCardStoreManager.getCardStore({
        type: 'composer-wallet-inmemory'
    });
    const adminName = 'utilsAdmin';

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
                await utils.createIdCard(adminConnection, { userID: 'user', enrollmentSecret: 'secret1' }, cardName);

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
