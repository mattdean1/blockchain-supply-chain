'use strict';

const path = require('path');

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { CertificateUtil, IdCard, BusinessNetworkDefinition } = require('composer-common');

const utils = require('./utils');

const constants = {
    growerNamespace: 'biswas.grower',
    growerName: 'Grower1',
    vineyardName: 'Vineyard1',
    vineyardRegion: 'Bordeaux',
    grapesName: 'Grapes1',
    grapesSpecies: 'Malbec',

    producerNamespace: 'biswas.producer',
    producerName: 'Producer1',
    bulkWineName: 'BulkWine1',
    bulkWineQuantity: 100,

    fillerNamespace: 'biswas.filler',
    fillerName: 'Filler1',
    bottledWineQuantity: 10,
    bottledWineName: 'BottledWine1',

    baseNamespace: 'biswas.base',

    transformations: {
        Grapes: {
            namespace: 'biswas.producer',
            name: 'BulkWine',
            scaleFactor: 0.1
        },
        BulkWine: {
            namespace: 'biswas.filler',
            name: 'BottledWine',
            scaleFactor: 3
        }
    }
};

// get a random integer between min and max
// from https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomIntInBounds(min, max) {
    return Math.random() * (max - min) + min;
}

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

async function setupParticipants(adminConnection, businessNetworkConnection) {
    let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

    // Create resources
    const vineyard = fac.newResource(constants.growerNamespace, 'Vineyard', constants.vineyardName);
    vineyard.altitude = 100;
    vineyard.location = fac.newConcept(constants.growerNamespace, 'Location');
    vineyard.location.latitude = 0.0;
    vineyard.location.longitude = 0.0;
    vineyard.region = constants.vineyardRegion;
    await utils.addAsset(businessNetworkConnection, constants.growerNamespace, 'Vineyard', vineyard);

    const vineyardRelation = fac.newRelationship(constants.growerNamespace, 'Vineyard', vineyard.$identifier);
    const grower = await utils.addUsableParticipant(
        adminConnection,
        businessNetworkConnection,
        constants.growerNamespace,
        'GrapeGrower',
        constants.growerName,
        {
            email: 'string@grower.com',
            vineyards: [vineyardRelation]
        }
    );

    const producer = await utils.addUsableParticipant(
        adminConnection,
        businessNetworkConnection,
        constants.producerNamespace,
        'WineProducer',
        constants.producerName,
        {
            email: 'string@producer.com'
        }
    );

    const filler = await utils.addUsableParticipant(
        adminConnection,
        businessNetworkConnection,
        constants.fillerNamespace,
        'Filler',
        constants.fillerName,
        {
            email: 'string@filler.com'
        }
    );

    return {
        vineyard,
        grower,
        producer,
        filler
    };
}

async function addGrapes(businessNetworkConnection, owner) {
    let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

    const grapes = fac.newResource(constants.growerNamespace, 'Grapes', constants.grapesName);
    grapes.quantity = 100;
    grapes.owner = owner;
    grapes.grapeGrower = fac.newRelationship(constants.growerNamespace, 'GrapeGrower', constants.growerName);
    grapes.species = constants.grapesSpecies;
    grapes.harvestDate = new Date(Date.now());
    grapes.vineyard = fac.newRelationship(constants.growerNamespace, 'Vineyard', constants.vineyardName);
    await utils.addAsset(businessNetworkConnection, constants.growerNamespace, 'Grapes', grapes);
}

async function addBulkWine(businessNetworkConnection, owner) {
    let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

    const bulkwine = fac.newResource(constants.producerNamespace, 'BulkWine', constants.bulkWineName);
    bulkwine.quantity = constants.bulkWineQuantity;
    bulkwine.owner = owner;
    bulkwine.year = 2018;
    bulkwine.grapes = fac.newRelationship(constants.growerNamespace, 'Grapes', constants.grapesName);
    bulkwine.producer = fac.newRelationship(constants.producerNamespace, 'WineProducer', constants.producerName);
    await utils.addAsset(businessNetworkConnection, constants.producerNamespace, 'BulkWine', bulkwine);
}

async function addBottledWine(businessNetworkConnection) {
    let fac = businessNetworkConnection.getBusinessNetwork().getFactory();

    const bottledWine = fac.newResource(constants.fillerNamespace, 'BottledWine', constants.bottledWineName);
    const fillerRelation = fac.newRelationship(constants.fillerNamespace, 'Filler', constants.fillerName);
    bottledWine.quantity = constants.bottledWineQuantity;
    bottledWine.owner = fillerRelation;
    bottledWine.filler = fillerRelation;
    bottledWine.alcoholPercentage = getRandomIntInBounds(9, 16);
    bottledWine.bulkWine = fac.newRelationship(constants.producerNamespace, 'BulkWine', constants.bulkWineName);
    await utils.addAsset(businessNetworkConnection, constants.fillerNamespace, 'BottledWine', bottledWine);
}

module.exports = {
    createAdminIdentity,
    deployNetwork,
    clearWallet,
    constants,
    setupParticipants,
    addGrapes,
    addBulkWine,
    addBottledWine
};
