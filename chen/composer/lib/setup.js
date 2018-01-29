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
* Setup the demo
* @param {org.hcsc.network.SetupDemo} setupDemo - the SetupDemo transaction
* @transaction
*/
function setupDemo(setupDemo) {    
    var factory = getFactory();
    var NS = 'org.hcsc.network';
    var roles = ['suppliers', 'manufacturers', 'distributors', 'retailers', 'customers'];
    var members = {};
    
    for (var role in setupDemo) {
      var type = (role.charAt(0).toUpperCase() + role.slice(1)).slice(0, -1);
      if (setupDemo[role] && roles.indexOf(role) !== -1) {
          members[role] = [];
          setupDemo[role].forEach(function(participant) {
              var newRole = factory.newResource(NS, type, participant.tradeId);
              newRole.companyName = participant.companyName;
              members[role].push(newRole);
          });      
      } 
    }   
    
    return getParticipantRegistry(NS + '.Supplier')
        .then(function (supplierRegistry){
          return supplierRegistry.addAll(members.suppliers);
        })
        .then(function(){
          return getParticipantRegistry(NS + '.Manufacturer')
        })
        .then(function (manufacturerRegistry){
          return manufacturerRegistry.addAll(members.manufacturers);
        })    
        .then(function(){
          return getParticipantRegistry(NS + '.Distributor')
        })  
        .then(function (distributorRegistry){
          return distributorRegistry.addAll(members.distributors);
        })      
        .then(function(){
          return getParticipantRegistry(NS + '.Retailer')
        })
        .then(function (retailersRegistry){
          return retailersRegistry.addAll(members.retailers);
        })
        .then(function(){
          return getParticipantRegistry(NS + '.Customer')
        })
        .then(function (customerRegistry){
          return customerRegistry.addAll(members.customers);
        })
}

