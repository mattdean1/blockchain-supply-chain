'use strict';

/**
 * Creates a WineBottle asset for each quantity of BottledWine
 * @param {biswas.distribution.sellBottle} tx
 * @transaction
 */
function sellBottle(tx) {
    // check batch is owned by submitter
    var bottle = tx.wineBottle;
    var factory = getFactory();

    var submitter = getCurrentParticipant();
    if (bottle.owner.$identifier !== submitter.$identifier) {
        throw new Error('You do not own that bottle');
    }

    return getAssetRegistry('biswas.filler.WineBottle').then(function(bottleRegistry) {
        // consume the BottledWine
        bottle.quantity = 0;
        return bottleRegistry.update(bottle);
    });
}
