'use strict';

/**
 * Creates a WineBottle asset for each quantity of BottledWine
 * @param {biswas.filler.labelBottles} tx
 * @transaction
 */
function labelBottles(tx) {
    // check batch is owned by submitter
    var bottledWine = tx.bottledWine;
    var factory = getFactory();

    var submitter = getCurrentParticipant();
    if (bottledWine.owner.$identifier !== submitter.$identifier) {
        throw new Error('You do not own that batch');
    }

    return getAssetRegistry('biswas.filler.WineBottle')
        .then(function(bottleRegistry) {
            var wineBottles = [];
            for (var i = 0; i < bottledWine.quantity; i++) {
                var id = 'WINEBOTTLE_' + i + Date.now();
                var wineBottle = factory.newResource('biswas.filler', 'WineBottle', id);

                wineBottle.quantity = 1;
                wineBottle.owner = factory.newRelationship('biswas.filler', 'Filler', submitter.$identifier);
                wineBottle.bottledWine = factory.newRelationship(
                    'biswas.filler',
                    'BottledWine',
                    bottledWine.$identifier
                );
                wineBottle.alcoholPercentage = bottledWine.alcoholPercentage;
                wineBottle.year = bottledWine.bulkWine.year;

                const grapes = bottledWine.bulkWine.grapes;
                wineBottle.name = grapes.vineyard.region + grapes.species;
                wineBottles.push(wineBottle);
            }
            return bottleRegistry.addAll(wineBottles);
        })
        .then(function() {
            return getAssetRegistry('biswas.filler.BottledWine');
        })
        .then(function(wineRegistry) {
            // consume the BottledWine
            bottledWine.quantity = 0;
            return wineRegistry.update(bottledWine);
        });
}
