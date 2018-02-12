'use strict';

/**
 * Transfers some quantity of a resource (e.g. grapes, wine bottles)
 * from one actor to another
 * @param {biswas.grower.SellGrapes} sale
 * @transaction
 */
function sellGrapes(sale) {
    var grapes = sale.grapes;
    var buyer = sale.buyer;
    var quantityToBeSold = sale.quantityToBeSold;
    var growerNamespace = 'biswas.grower';

    // verify that the grapes can be sold
    if (quantityToBeSold > grapes.quantity) {
        throw new Error('Batch of grapes is too small');
    }
    var grower = getCurrentParticipant();
    if (grapes.owner !== grower || grapes.grapeGrower !== grower) {
        throw new Error('You do not own those grapes');
    }
    if (!grower.vineyards || !grower.vineyards.includes(grapes.vineyard)) {
        throw new Error('Those grapes are not from your vineyard');
    }
    // check buyer exists?

    var grapesRegistry;
    return getAssetRegistry(growerNamespace + '.Grapes')
        .then(function(grapesReg) {
            grapesRegistry = grapesReg;
            // create a new batch of grapes for the new owner
            var id = 'GRAPES_' + 'asdf'; //uuid();
            var newGrapes = getFactory().newResource(
                growerNamespace,
                'Grapes',
                id
            );
            newGrapes.id = id;
            newGrapes.quantity = quantityToBeSold;
            newGrapes.owner = getFactory().newRelationship(
                'biswas.producer',
                'WineProducer',
                buyer
            );

            return grapesRegistry.add(newGrapes);
        })
        .then(function() {
            // decrement the quantity of the batch sold
            var newQuantity = grapes.quantity - quantityToBeSold;
            grapes.quantity = newQuantity;
            return grapesRegistry.update(grapes);
        })
        .catch(function(err) {
            console.log('err in tx func');
            console.log(err);
        });
}
