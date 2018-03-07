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
    var producerNamespace = NS + '.producer';
    var growerNamespace = NS + '.grower';

    var producer = getCurrentParticipant();
    if (grapes.owner.$identifier !== producer.$identifier) {
        throw new Error('You do not own those grapes');
    }

    return getAssetRegistry(producerNamespace + '.BulkWine')
        .then(function(bwReg) {
            // Create the BulkWine
            var id = 'BULKWINE_' + Date.now();
            var bulkWine = factory.newResource(producerNamespace, 'BulkWine', id);
            bulkWine.grapes = factory.newRelationship(growerNamespace, 'Grapes', grapes.$identifier);
            bulkWine.producer = factory.newRelationship(producerNamespace, 'WineProducer', producer.$identifier);
            bulkWine.owner = factory.newRelationship(producerNamespace, 'WineProducer', producer.$identifier);
            bulkWine.quantity = grapes.quantity / 2;
            bulkWine.year = grapes.harvestDate.getFullYear();

            // emit an event
            var event = factory.newEvent(producerNamespace, 'WineCreated');
            event.bulkWine = factory.newRelationship(producerNamespace, 'BulkWine', bulkWine.$identifier);
            emit(event);

            return bwReg.add(bulkWine);
        })
        .then(function() {
            return getAssetRegistry(growerNamespace + '.Grapes');
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
