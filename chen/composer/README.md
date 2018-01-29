# Copyright Chen 2017

https://github.com/aprilsnows/hyperledger-composer-supply-chain-network

# Hyperledger Composer Supply Chain Network

This is one implementation of [Hyperledger Composer](https://github.com/hyperledger/composer) for supply chain, which demonstrates how Hyperledger blockchain improve transparency and traceability of industrial supply chain.

![](/docs/flow.png)

### How to run it?

1. Install packages: `npm install`
2. Create a folder for local archive: `mkdir dist`
3. Generate the BNA(Business Network Archieve) file: `npm run prepublish`
4. Next, in a browser, navigate to the online Bluemix Composer Playground http://composer-playground.mybluemix.net and import the newly-generated BNA file into the Playground using the "Import/Replace" button at the bottom left of the screen. Locate the `dist/hyperledger-supply-chain-network.bna` file under your 'hyperledger-supply-chain-network' folder and upload it. This automatically deploys the new business network. 
5. Try to play with it. ([Playground Tutorial](https://hyperledger.github.io/composer/tutorials/playground-guide.html))

Congratulations!

P.S. No.4 just only runs on web brower, all the data are stored in local storage. If you want run it on real blockchain network. Please follow [Developer Guide](https://hyperledger.github.io/composer/tutorials/developer-guide.html) and [Developer Environment](https://hyperledger.github.io/composer/installing/development-tools.html) to make it real!

### Model
This business network defines:

- **Participant**
`Supplier` `Manufacturer` `Distributor` `Retailer`  `Customer`

- **Asset**
`Commodity`

- **Transaction**
`InitiatePO` `TransferCommodity` `SetupDemo`

- **Event**
`none`

Commodity are owned by a Supplier, Manufacturer, Distributor, Retailer or Customer,  and the owner property on a Commodity can be modified by submitting a transaction(e.g. M2O, O2D). The transaction emits a SampleEvent that notifies applications of the old and new values for each modified Commodity.(WIP)

### How to play on Bluemix Composer Playground?

To test this Business Network Definition in the **Test** tab:

Create a `Manufacturer` participant:

```
{
  "$class": "org.hcsc.network.Manufacturer",
  "tradeId": "M1",
  "companyName": "FAST"
}
```

Create a `Commodity` asset:

```
{
  "$class": "org.hcsc.network.Commodity",
  "tradingSymbol": "ts1",
  "description": "Aliquip.",
  "quantity": 216.3,
  "owner": "resource:org.hcsc.network.Manufacturer#M1"
}
```

Submit a `TransferCommodity` transaction:

```
{
  "$class": "org.hcsc.network.TransferCommodity",
  "commodity": "resource:org.hcsc.network.Commodity#ts1",
  "issuer": "resource:org.hcsc.network.Manufacturer#M1",
  "newOwner": "resource:org.hcsc.network.Distributor#D1"
}
```

After submitting this transaction, you should now see the transaction in the Transaction Registry and that a `SampleEvent` has been emitted(WIP). As a result, the value of the `tradingSymbol:ts1` should now be `new owner` in the Asset Registry.

### Pre-requisites on MacOS
- [Install nvm and Apple Xcode](https://hyperledger.github.io/composer/installing/prereqs-mac.html)
- [Installing Hyperledger Composer development tools](https://hyperledger.github.io/composer/installing/development-tools.html) (Most important: `npm install -g composer-cli`)

### Installing and running Hyperledger Composer Playground locally
1. Pick a directory that you want to install into, then run the following command to download and start a Hyperledger Fabric instance and Hyperledger Composer Playground:
```
curl -sSL https://hyperledger.github.io/composer/install-hlfv1.sh | bash
```
2. Access your local Hyperledger Composer Playground by clicking this link: http://localhost:8080. Please note: Private browsing is not supported when running the Playground locally.


### Set Up Fabric
1. kill and remove all running containers, and should remove all previously created Hyperledger Fabric chaincode images.
```
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
```
2. Download the fabric runtime first. If you have already downloaded it, then start the fabric environment, and create a Hyperledger Composer profile. :
```
cd tools/fabric/
./downloadFabric.sh
./startFabric.sh
./createComposerProfile.sh
```
3. Stop Fabric runtime at the end of your development session:
```
cd tools/fabric/
./stopFabric.sh
./teardownFabric.sh
```

### More info:
- Build on [template](https://github.com/hyperledger/composer-sample-networks/tree/master/packages/basic-sample-network)
- Hyperledger Composer Official [Documentation](https://hyperledger.github.io/composer/introduction/introduction.html)
- Developer [Guide](https://hyperledger.github.io/composer/tutorials/developer-guide.html)
- In-depth research on hyperledger composer [link](https://github.com/aietcn/hyperledger-composer)
