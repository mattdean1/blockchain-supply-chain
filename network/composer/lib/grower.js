'use strict';

/**
 * Transfers some quantity of grapes from a GrapeGrower to a WineProducer
 * @param {biswas.grower.SellGrapes} sale
 * @transaction
 */
function sellGrapes(sale) {
    var grapes = sale.grapes;
    var buyer = sale.buyer;
    var quantityToBeSold = sale.quantity;
    var growerNamespace = 'biswas.grower';
    var factory = getFactory();

    // verify that the grapes can be sold
    if (quantityToBeSold > grapes.quantity) {
        throw new Error('Batch of grapes is too small');
    }
    if (quantityToBeSold <= 0) {
        throw new Error('You must sell at least one grape!');
    }
    var grower = getCurrentParticipant();
    var growerID = grower.$identifier;
    if (grapes.owner.$identifier !== growerID || grapes.grapeGrower.$identifier !== growerID) {
        throw new Error('You do not own those grapes');
    }
    if (
        !grower.vineyards ||
        !grower.vineyards
            .map(function(v) {
                return v.$identifier;
            })
            .includes(grapes.vineyard.$identifier)
    ) {
        throw new Error('Those grapes are not from your vineyard');
    }

    var grapesRegistry;
    return getAssetRegistry(growerNamespace + '.Grapes')
        .then(function(grapesReg) {
            grapesRegistry = grapesReg;
            // create a new batch of grapes for the new owner
            var id = 'GRAPES_' + Date.now();
            var newGrapes = factory.newResource(growerNamespace, 'Grapes', id);
            newGrapes.quantity = quantityToBeSold;
            newGrapes.species = grapes.species;
            newGrapes.harvestDate = grapes.harvestDate;
            newGrapes.owner = factory.newRelationship('biswas.producer', 'WineProducer', buyer.$identifier);
            newGrapes.grapeGrower = factory.newRelationship(
                growerNamespace,
                'GrapeGrower',
                grapes.grapeGrower.$identifier
            );
            newGrapes.vineyard = factory.newRelationship(growerNamespace, 'Vineyard', grapes.vineyard.$identifier);

            return grapesRegistry.add(newGrapes);
        })
        .then(function() {
            // decrement the quantity of the batch sold
            var newQuantity = grapes.quantity - quantityToBeSold;
            grapes.quantity = newQuantity;
            return grapesRegistry.update(grapes);
        });
}
