'use strict';
const uuid = require('uuid/v4');

/**
 * Transfers some quantity of a resource (e.g. grapes, wine bottles)
 * from one actor to another
 * @param {biswas.grower.SellGrapes} sale
 * @transaction
 */
const sellGrapes = (sale) => {
    const { grapes, buyer, quantityToBeSold } = sale
    const growerNamespace = 'biswas.grower'
    
    // verify that the grapes can be sold
    if (quantityToBeSold > grapes.quantity) {
        throw new Error('Batch of grapes is too small')
    }
    const grower = getCurrentParticipant()
    if(grapes.owner !== grower || grapes.grapeGrower !== grower) {
        throw new Error('You do not own those grapes')
    }
    if (!grower.vineyards || !grower.vineyards.includes(grapes.vineyard)) {
        throw new Error('Those grapes are not from your vineyard')
    }
    // check buyer exists?
    
    let grapesRegistry;
    return getAssetRegistry(growerNamespace + '.Grapes')
        .then(grapesReg => {
            grapesRegistry = grapesReg
            // create a new batch of grapes for the new owner
            const id = `GRAPES_${uuid()}`;
            let newGrapes = getFactory().newResource(growerNamespace, 'Grapes', id)
            newGrapes = Object.assign(newGrapes, grapes, {
                id: id,
                quantity: quantityToBeSold,
                owner: buyer
            })
            return grapesRegistry.add(newGrapes)
        })
        .then(() => {
            // decrement the quantity of the batch sold
            const newQuantity = grapes.quantity - quantityToBeSold
            grapes.quantity = newQuantity
            return grapesRegistry.update(grapes)
        })
}