'use strict';
const uuid = require('uuid/v4');


const grapesToWine = (grapesQuantity) => {
    // Convert the units of grapes to wine
    return grapesQuantity / 2
}

/**
 * Transfers some quantity of a resource (e.g. grapes, wine bottles)
 * from one actor to another
 * @param {biswas.producer.CreateWine} create
 * @transaction
 */
const createWine = (create) => {
    // check grapes are owned by producer submitting transaction
    const { grapes } = create
    const factory = getFactory()
    const NS = 'biswas'
    const producerNamespace = NS + 'producer'
    const growerNamespace = NS + 'grower'

    const producer = getCurrentParticipant()
    if (grapes.owner !== producer) {
        throw new Error('You do not own those grapes')
    }

    return getAssetRegistry(producerNamespace + '.BulkWine')
        .then(bwReg => {
            // Create the BulkWine
            const id = `BULKWINE_${uuid()}`;
            let bulkWine = getFactory().newResource(producerNamespace, 'BulkWine', id)
            Object.assign(bulkWine, {
                grapes,
                producer,
                owner: producer,
                quantity: grapesToWine(grapes.quantity)
            })

            return bwReg.add(bulkWine)
        })
        .then(() => {
            return getAssetRegistry(growerNamespace + 'Grapes')
        })
        
        .then(grapesRegistry => {
            // Consume the grapes - assume the entire batch is used
            grapes.quantity = 0
            grapesRegistry.update(grapes)
        })

}