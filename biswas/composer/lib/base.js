'use strict';

/**
 * Sell a batch
 * @param {biswas.base.sellBatch} tx
 * @transaction
 */
function sellBatch(tx) {
    // check wine is owned by submitter
    var batch = tx.batch;
    var factory = getFactory();
    var NS = 'biswas';

    if (tx.quantity > batch.quantity) {
        throw new Error('Batch is too small');
    }
    if (tx.quantity <= 0) {
        throw new Error('You must sell at least one item!');
    }

    var seller = getCurrentParticipant();
    if (batch.owner.$identifier !== seller.$identifier) {
        throw new Error('You do not own that batch');
    }

    function assignBatchProperties(oldBatch, newBatch) {
        var forbiddenProps = ['batchId'];
        Object.keys(oldBatch)
            .filter(function(prop) {
                return prop.charAt(0) !== '$' && !forbiddenProps.includes(prop);
            })
            .forEach(function(prop) {
                newBatch[prop] = oldBatch[prop];
            });
    }

    var assetNamespace = tx.batch.$namespace;
    var assetName = tx.batch.$type;
    var fqAssetName = `${assetNamespace}.${assetName}`;
    var buyer = tx.buyer;
    var batchRegistry;

    return getAssetRegistry(fqAssetName)
        .then(function(batchReg) {
            batchRegistry = batchReg;
            // create a new batch for the new owner
            var id = assetName + '_' + Date.now();
            var newBatch = factory.newResource(assetNamespace, assetName, id);

            assignBatchProperties(batch, newBatch);
            newBatch.quantity = tx.quantity;
            newBatch.owner = factory.newRelationship(buyer.$namespace, buyer.$type, buyer.$identifier);

            return batchRegistry.add(newBatch);
        })
        .then(function() {
            // decrement the quantity of the original batch
            var newQuantity = batch.quantity - tx.quantity;
            batch.quantity = newQuantity;
            return batchRegistry.update(batch);
        });
}
