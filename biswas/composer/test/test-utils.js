'use strict';

/**
 * Write the unit tests for your transction processor functions here
 */

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { CertificateUtil, IdCard, BusinessNetworkDefinition } = require('composer-common');

const path = require('path');

async function createAdminIdentity1(cardStore) {
    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };
    const credentials = CertificateUtil.generate({ commonName: 'admin' });

    // PeerAdmin identity used with the admin connection to deploy business networks
    const deployerMetadata = {
        version: 1,
        userName: 'PeerAdmin',
        roles: ['PeerAdmin', 'ChannelAdmin']
    };
    const deployerCard = new IdCard(deployerMetadata, connectionProfile);
    deployerCard.setCredentials(credentials);

    const deployerCardName = 'PeerAdmin';
    let adminConnection = new AdminConnection({ cardStore: cardStore });

    await adminConnection.importCard(deployerCardName, deployerCard);
    await adminConnection.connect(deployerCardName);
    return adminConnection;
}

async function deployNetwork1(cardStore, adminConnection) {
    let businessNetworkConnection = new BusinessNetworkConnection({
        cardStore: cardStore
    });

    const adminUserName = 'admin';

    const bnd = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
    await adminConnection.install(bnd.getName());
    const adminCards = await adminConnection.start(bnd, {
        networkAdmins: [
            {
                userName: adminUserName,
                enrollmentSecret: 'adminpw'
            }
        ]
    });

    const adminCardName = `${adminUserName}@${bnd.getName()}`;
    await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));
    await businessNetworkConnection.connect(adminCardName);

    return businessNetworkConnection;
}

module.exports = {
    createAdminIdentity1,
    deployNetwork1
};
