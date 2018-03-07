'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { CertificateUtil, IdCard, BusinessNetworkDefinition } = require('composer-common');

const path = require('path');

async function createAdminIdentity(cardStore, name) {
    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded',
        businessNetwork: 'biswas'
    };
    const credentials = CertificateUtil.generate({ commonName: 'admin' });

    // PeerAdmin identity used with the admin connection to deploy business networks
    const deployerMetadata = {
        version: 1,
        userName: name,
        roles: ['PeerAdmin', 'ChannelAdmin']
    };
    const deployerCard = new IdCard(deployerMetadata, connectionProfile);
    deployerCard.setCredentials(credentials);

    const deployerCardName = name;
    let adminConnection = new AdminConnection({ cardStore: cardStore });

    await adminConnection.importCard(deployerCardName, deployerCard);
    await adminConnection.connect(deployerCardName);
    return adminConnection;
}

async function deployNetwork(cardStore, adminConnection) {
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

async function clearWallet(adminConnection) {
    const cards = await adminConnection.getAllCards();
    for (let [cardName, _] of cards) {
        await adminConnection.deleteCard(cardName);
    }
}

module.exports = {
    createAdminIdentity,
    deployNetwork,
    clearWallet
};
