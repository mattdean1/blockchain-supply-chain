'use strict';

const { IdCard, CertificateUtil } = require('composer-common');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

async function addParticipant(networkConnection, namespace, type, id, fields) {
    let participantRegistry = await networkConnection.getParticipantRegistry(namespace + '.' + type);

    const factory = networkConnection.getBusinessNetwork().getFactory();
    let participant = factory.newResource(namespace, type, id);
    Object.assign(participant, fields);

    await participantRegistry.add(participant);
    return participant;
}

async function createIdCard(adminConnection, identity, cardName) {
    const metadata = {
        version: 1,
        userName: identity.userID,
        enrollmentSecret: identity.userSecret,
        businessNetwork: 'biswas'
    };
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    const card = new IdCard(metadata, connectionProfile);

    await adminConnection.importCard(cardName, card);
}

async function addUsableParticipant(adminConnection, networkConnection, namespace, type, id, fields) {
    const participant = await addParticipant(networkConnection, namespace, type, id, fields);
    const identity = await networkConnection.issueIdentity(participant, id + 'id');
    await createIdCard(adminConnection, identity, id);

    return participant;
}

async function connectParticipant(networkConnection, cardStore, username) {
    await networkConnection.disconnect();
    networkConnection = new BusinessNetworkConnection({ cardStore });
    await networkConnection.connect(username);
    return networkConnection;
}

async function connectAdmin(networkConnection) {
    const adminCardName = 'admin@' + networkConnection.getBusinessNetwork().getName();
    await networkConnection.disconnect();
    await networkConnection.connect(adminCardName);
}

async function addAsset(networkConnection, namespace, type, asset) {
    const registry = await networkConnection.getAssetRegistry(`${namespace}.${type}`);
    await registry.add(asset);
}

module.exports = {
    addParticipant,
    createIdCard,
    addUsableParticipant,
    connectParticipant,
    connectAdmin,
    addAsset
};
