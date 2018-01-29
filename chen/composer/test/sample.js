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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BrowserFS = require('browserfs/dist/node/index');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const path = require('path');

require('chai').should();

const bfs_fs = BrowserFS.BFSRequire('fs');
const NS = 'org.hcsc.network';

describe('Commodity Trading', () => {

    // let adminConnection;
    let businessNetworkConnection;

    before(() => {
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());
        const adminConnection = new AdminConnection({ fs: bfs_fs });
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');
            })
            .then(() => {
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
            })
            .then((businessNetworkDefinition) => {
                return adminConnection.deploy(businessNetworkDefinition);
            })
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ fs: bfs_fs });
                return businessNetworkConnection.connect('defaultProfile', 'hyperledger-composer-supply-chain-network', 'admin', 'adminpw');
            });
    });

    describe('#tradeCommodity', () => {

        it('should be able to trade a commodity', () => {
            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the Manufacturer
            const m1 = factory.newResource(NS, 'Manufacturer', 'M1');
            m1.companyName = 'FASTory';

            // create the OEMs
            const o1 = factory.newResource(NS, 'OEM', 'O1');
            o1.companyName = 'Red';
            const o2 = factory.newResource(NS, 'OEM', 'O2');
            o2.companyName = 'Blue';
            const o3 = factory.newResource(NS, 'OEM', 'O3');
            o3.companyName = 'Green';

            // create the Distributors
            const d1 = factory.newResource(NS, 'Distributor', 'D1');
            d1.companyName = 'East';
            const d2 = factory.newResource(NS, 'Distributor', 'D2');
            d2.companyName = 'South';
            const d3 = factory.newResource(NS, 'Distributor', 'D3');
            d3.companyName = 'North';

            // create the commodity
            const commodity = factory.newResource(NS, 'Commodity', 'EP1');
            commodity.description = 'Engine Pump';
            commodity.mainExchange = 'Euronext';
            commodity.quantity = 100;
            commodity.owner = factory.newRelationship(NS, 'Manufacturer', m1.$identifier);

            // create the trade transaction
            const trade = factory.newTransaction(NS, 'M2O');
            trade.issuer = factory.newRelationship(NS, 'Manufacturer', m1.$identifier);
            trade.newOwner = factory.newRelationship(NS, 'OEM', o1.$identifier);
            trade.commodity = factory.newRelationship(NS, 'Commodity', commodity.$identifier);

            // the owner should of the commodity should be m1
            commodity.owner.$identifier.should.equal(m1.$identifier);

            // Get the asset registry.
            let commodityRegistry;
            return businessNetworkConnection.getAssetRegistry(NS + '.Commodity')
                .then((assetRegistry) => {
                    commodityRegistry = assetRegistry;
                    // add the commodity to the asset registry.
                    return commodityRegistry.add(commodity);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Manufacturer');
                })
                .then((participantRegistry) => {
                    // add the traders
                    return participantRegistry.addAll([m1, o1]);
                })
                .then(() => {
                    // submit the transaction
                    return businessNetworkConnection.submitTransaction(trade);
                })
                .then(() => {
                    // re-get the commodity
                    return commodityRegistry.get(commodity.$identifier);
                })
                .then((newCommodity) => {
                    // the owner of the commodity should now be o1
                    newCommodity.owner.$identifier.should.equal(o1.$identifier);
                });
        });
    });
});
