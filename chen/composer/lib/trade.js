/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Track the trade of a commodity from one trader to another
 * @param {org.hcsc.network.TransferCommodity} trade - the trade to be processed
 * @transaction
 */
function transferCommodity (trade) {
    console.log(trade);
    
    var NS = 'org.hcsc.network';
    var factory = getFactory();

    var me = getCurrentParticipant();
    // if (trade.issuer && me.getFullyQualifiedIdentifier() !== trade.issuer.getFullyQualifiedIdentifier()) {
    //     throw new Error('The issuer that you signed does not match your identity!');
    // }

    trade.commodity.issuer = me;
    trade.commodity.owner = trade.newOwner;
    trade.commodity.purchaseOrder = trade.purchaseOrder;
    
    var newTrace = factory.newConcept(NS, 'Trace');
    newTrace.timestamp = new Date();
    newTrace.location = trade.shipperLocation;
    newTrace.company = me;
    trade.commodity.trace.push(newTrace);
    

   	return getAssetRegistry('org.hcsc.network.Commodity')
   		.then(function (assetRegistry) {
       		return assetRegistry.update(trade.commodity);
     	});
 }
 
/**
 * Initiate PO from one trader to another
 * @param {org.hcsc.network.InitiatePO} InitiatePO - the InitiatePO to be processed
 * @transaction
*/
function initiatePurchaseOrder (InitiatePO) {
    console.log('InitiatePO');

    var factory = getFactory();
    var NS = 'org.hcsc.network';
    
    var me = getCurrentParticipant();
    // if ( InitiatePO.orderer && me.getFullyQualifiedIdentifier() !== InitiatePO.orderer.getFullyQualifiedIdentifier()) {
    //     throw new Error('The orderer that you signed does not match your identity!');
    // }

    var order = factory.newResource(NS, 'PO', InitiatePO.orderId);
    order.itemList = InitiatePO.itemList;
    if (InitiatePO.orderTotalPrice) {
        order.orderTotalPrice = InitiatePO.orderTotalPrice;
    }
    order.orderStatus = 'INITIATED';
    order.orderer = me;
    order.vender = InitiatePO.vender;

   	return getAssetRegistry(order.getFullyQualifiedType())
   		.then(function (assetRegistry) {
       		return assetRegistry.add(order);
     	});
 }