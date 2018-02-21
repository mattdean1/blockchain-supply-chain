'use strict';

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
            var id = 'BULKWINE_' + 'asdf'; //uuid();
            var bulkWine = factory.newResource(
                producerNamespace,
                'BulkWine',
                id
            );
            bulkWine.grapes = factory.newRelationship(
                growerNamespace,
                'Grapes',
                grapes
            );
            bulkWine.producer = factory.newRelationship(
                producerNamespace,
                'WineProducer',
                producer
            );
            bulkWine.owner = factory.newRelationship(
                producerNamespace,
                'WineProducer',
                producer
            );
            bulkWine.quantity = grapes.quantity / 2;
            bulkWine.year = grapes.harvestDate.split('-')[0]; // should/could parse date properly here

            // emit an event
            var event = factory.newEvent(producerNamespace, 'WineCreated');
            event.bulkWine = factory.newRelationship(
                producerNamespace,
                'BulkWine',
                bulkWine
            );
            emit(event);

            return bwReg.add(bulkWine);
        })
        .then(function() {
            return getAssetRegistry(growerNamespace + 'Grapes');
        })
        .then(function(grapesRegistry) {
            // Consume the grapes - assume the entire batch is used
            grapes.quantity = 0;
            return grapesRegistry.update(grapes);
        })
        .catch(function(err) {
            console.log('err in tx func');
            console.log(err);
        });
}
