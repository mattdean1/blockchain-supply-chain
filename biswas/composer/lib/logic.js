'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Transfers some quantity of a resource (e.g. grapes, wine bottles)
 * from one actor to another
 * @param {biswas.base.SellGrapes} sale
 * @transaction
 */
function sellGrapes(sale) {
    const { grapes, buyer, quantityToBeSold } = sale
    // verify that the grapes can be sold
        // quantity is ok
        // participant is the owner of the batch
        // vineyard is owned by grapegrower
        
    // create a new batch of grapes

    // decrement original grapes quantity
        // if 0 then 
}