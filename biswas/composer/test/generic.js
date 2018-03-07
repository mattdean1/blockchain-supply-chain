'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, NetworkCardStoreManager, CertificateUtil, IdCard } = require('composer-common');

const path = require('path');

require('chai').should();

const utils = require('../src/utils.js');
const testUtils = require('../src/test-utils.js');
const constants = testUtils.constants;

describe('Namespace', () => {
    let adminConnection;
    let businessNetworkConnection;
    const adminName = 'namespaceAdmin';
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

    describe('TxFunction()', () => {
        beforeEach(async () => {
            const { grower, vineyard, producer } = await testUtils.setupParticipants(
                adminConnection,
                businessNetworkConnection
            );
        });

        it('should do something');
        it('should emit x event');
    });
});
