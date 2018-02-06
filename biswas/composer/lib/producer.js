'use strict';
var uuid = require('uuid/v4');

/**
 * Convert the units of grapes to wine
 */
function grapesToWine(grapesQuantity) {
    return grapesQuantity / 2;
}

/**
 * Transfers some quantity of a resource (e.g. grapes, wine bottles)
 * from one actor to another
 * @param {biswas.producer.CreateWine} create
 * @transaction
 */
function createWine(create) {
    // check grapes are owned by producer submitting transaction
    var grapes = create.grapes;
    var factory = getFactory();
    var NS = 'biswas';
    var producerNamespace = NS + 'producer';
    var growerNamespace = NS + 'grower';

    var producer = getCurrentParticipant();
    if (grapes.owner !== producer) {
        throw new Error('You do not own those grapes');
    }

    return getAssetRegistry(producerNamespace + '.BulkWine')
        .then(function(bwReg) {
            // Create the BulkWine
            var id = 'BULKWINE_' + uuid();
            var bulkWine = getFactory().newResource(
                producerNamespace,
                'BulkWine',
                id
            );
            Object.assign(bulkWine, {
                grapes: grapes,
                producer: producer,
                owner: producer,
                quantity: grapesToWine(grapes.quantity)
            });

            return bwReg.add(bulkWine);
        })
        .then(function() {
            return getAssetRegistry(growerNamespace + 'Grapes');
        })

        .then(function(grapesRegistry) {
            // Consume the grapes - assume the entire batch is used
            grapes.quantity = 0;
            grapesRegistry.update(grapes);
        });
}
