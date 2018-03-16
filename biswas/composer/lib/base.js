'use strict';

var transformations = {
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
};

function copyBatchProperties(oldBatch, newBatch) {
    var forbiddenProps = ['batchId'];
    Object.keys(oldBatch)
        .filter(function(prop) {
            return prop.charAt(0) !== '$' && !forbiddenProps.includes(prop);
        })
        .forEach(function(prop) {
            newBatch[prop] = oldBatch[prop];
        });
}

// get a random integer between min and max
// from https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomIntInBounds(min, max) {
    return Math.random() * (max - min) + min;
}

function assignBatchProperties(oldBatch, newBatch, factory) {
    switch (oldBatch.$type) {
    case 'Grapes':
        newBatch.grapes = factory.newRelationship('biswas.grower', 'Grapes', oldBatch.$identifier);
        newBatch.producer = factory.newRelationship('biswas.producer', 'WineProducer', newBatch.owner.$identifier);
        newBatch.year = oldBatch.harvestDate.getFullYear();
        break;
    case 'BulkWine':
        newBatch.bulkWine = factory.newRelationship('biswas.producer', 'BulkWine', oldBatch.$identifier);
        newBatch.filler = factory.newRelationship('biswas.filler', 'Filler', newBatch.owner.$identifier);
        newBatch.alcoholPercentage = getRandomIntInBounds(9, 16);
        break;
    }
}

/**
 * Sell a batch
 * @param {biswas.base.sellBatch} tx
 * @transaction
 */
function sellBatch(tx) {
    var batch = tx.batch;
    var factory = getFactory();

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

            copyBatchProperties(batch, newBatch);
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

/**
 * Transform a batch
 * @param {biswas.base.transformBatch} tx
 * @transaction
 */
function transformBatch(tx) {
    // check batch is owned by submitter
    var oldBatch = tx.batch;
    var factory = getFactory();

    var submitter = getCurrentParticipant();
    if (oldBatch.owner.$identifier !== submitter.$identifier) {
        throw new Error('You do not own that batch');
    }

    var oldBatchNamespace = tx.batch.$namespace;
    var oldBatchName = tx.batch.$type;
    var oldFQBatchName = `${oldBatchNamespace}.${oldBatchName}`;

    var newBatchDetails = transformations[oldBatchName];
    var newFQBatchName = `${newBatchDetails.namespace}.${newBatchDetails.name}`;
    var newBatch;

    return getAssetRegistry(newFQBatchName)
        .then(function(newBatchRegistry) {
            // create a new batch for the new owner
            var id = newBatchDetails.name + '_' + Date.now();
            newBatch = factory.newResource(newBatchDetails.namespace, newBatchDetails.name, id);

            newBatch.quantity = parseInt(oldBatch.quantity * newBatchDetails.scaleFactor);
            newBatch.owner = factory.newRelationship(submitter.$namespace, submitter.$type, submitter.$identifier);
            assignBatchProperties(oldBatch, newBatch, factory);

            return newBatchRegistry.add(newBatch);
        })
        .then(function() {
            return getAssetRegistry(oldFQBatchName);
        })
        .then(function(oldBatchRegistry) {
            // Consume the original batch
            oldBatch.quantity = 0;
            return oldBatchRegistry.update(oldBatch);
        })
        .then(function() {
            // emit an event
            var event = factory.newEvent('biswas.base', 'BatchTransformed');
            event.batchTypeConsumed = oldBatchName;
            event.oldBatch = factory.newRelationship(oldBatchNamespace, oldBatchName, oldBatch.$identifier);
            event.batchTypeCreated = newBatchDetails.name;
            event.newBatch = factory.newRelationship(
                newBatchDetails.namespace,
                newBatchDetails.name,
                newBatch.$identifier
            );
            emit(event);
        });
}
