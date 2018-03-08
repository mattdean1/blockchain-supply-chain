# Composer

### Generate composer boilerplate

```shell
npx yo hyperledger-composer:businessnetwork
Welcome to the business network generator
? Business network name: biswas
? Description: Implementation of the supply chain model proposed by Biswas
? Author name:  Matt Dean
? Author email: mail@mattdean.io
? License: Apache-2.0
? Namespace: org1.biswas.com

cd composer
npm i
```

### Generate business network archive

To be deployed onto fabric

```
composer archive create --sourceType dir --sourceName .
```



# Fabric

## Download Binaries

Run the following command within the directory you wish to extract the binaries into:

````
curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0-rc1
export PATH=/path/to/binaries:$PATH
````



## Prepare filestructure

```shell
mkdir fabric && cd fabric
mkdir artifacts && mkdir artifacts/certs && mkdir artifacts/channel
mkdir config
```

Place `configtx.yaml` and `crypto-config.yaml` in the `config` directory.



## Generate startup artifacts

### Certificates

> Cryptogen consumes a file - ``crypto-config.yaml`` - that contains the network topology and allows us to generate a library of certificates for the Organizations and their components.

```shell
cryptogen generate --config=./config/crypto-config.yaml --output=./artifacts/certs
```

 ### Channel artifacts

The `configtxgen` tool consumes `configtx.yaml` to create: 

- An orderer genesis block
- A channel creation transaction
- Some anchor peer transactions - one for each Peer Org

```shell
export FABRIC_CFG_PATH=./config && export CHANNEL_NAME=channel1

configtxgen -profile GenesisBlockGeneration -outputBlock ./artifacts/channel/genesis.block


configtxgen -profile ChannelCreation -outputCreateChannelTx ./artifacts/channel/channel.tx -channelID $CHANNEL_NAME

configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/GrowerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg GrowerMSP

configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/ProducerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProducerMSP
```



## Start the network

### Start/Stop

```Shell
export COMPOSE_PROJECT_NAME=biswas

docker-compose -f docker/docker-compose-sdk.yaml up -d
docker-compose -f docker/docker-compose-sdk.yaml down
```

### Set up channel

```
docker exec cli /bin/sh "./createChannel.sh"
```

This performs the steps of:

- Creating the channel
- Joining peers to the channel
- Updating anchor peers for the channel



Alternatively, you can use `docker exec -it cli bash` and run the commands from  `./createChannel.sh` yourself.

## Install and instantiate composer network

### Create business network cards for fabric admins 

Replace names of keys (i.e. `*_sk`) with the actual filename.

```
mkdir ./id-cards

composer card create\
 -p connection-profiles/grower.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-grower.card\
 -k ./artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp/keystore/8ef3b6e18b7aa0065d4447bd0032a3b2023a659fd1bfb13358c4d7f7cafb39c6_sk\
 -c ./artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp/signcerts/Admin@grower.biswas.com-cert.pem

composer card import -f ./id-cards/PeerAdmin@biswas-grower.card

composer card create\
 -p connection-profiles/producer.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-producer.card\
 -k ./artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp/keystore/d1c84d49eaae90e3cff68461d8c7079c0317bb811b6ffe4c39bb17898845ebdb_sk\
 -c ./artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp/signcerts/Admin@producer.biswas.com-cert.pem

composer card import -f ./id-cards/PeerAdmin@biswas-producer.card
```

### Install composer runtime

```
composer runtime install -c PeerAdmin@biswas-grower -n biswas
composer runtime install -c PeerAdmin@biswas-producer -n biswas
```

### Enroll identities and create BNCs for network admins

```
composer identity request -c PeerAdmin@biswas-grower -u admin -s adminpw -d ./id-cards/grower-network-admin

composer card create -p connection-profiles/grower.json -u grower-network-admin -n biswas -c id-cards/grower-network-admin/admin-pub.pem -k id-cards/grower-network-admin/admin-priv.pem -f id-cards/grower-network-admin.card

composer card import -f id-cards/grower-network-admin.card


composer identity request -c PeerAdmin@biswas-producer -u admin -s adminpw -d ./id-cards/producer-network-admin

composer card create -p connection-profiles/producer.json -u producer-network-admin -n biswas -c id-cards/producer-network-admin/admin-pub.pem -k id-cards/producer-network-admin/admin-priv.pem -f id-cards/producer-network-admin.card

composer card import -f id-cards/producer-network-admin.card
```

### Start the network

```
composer network start\
 -c PeerAdmin@biswas-grower\
 -a composer/biswas.bna\
 -A grower-network-admin\
 -C fabric/id-cards/grower-network-admin/admin-pub.pem\
 -A producer-network-admin\
 -C fabric/id-cards/producer-network-admin/admin-pub.pem
```

### Ping the network

Expect the first interaction using a business card to fail, subsequent interactions will work fine.

```
composer network ping -c grower-network-admin@biswas
composer network ping -c producer-network-admin@biswas
```





# Upgrade process

#### Remove previously generated fabric artifacts

```
rm -rf fabric/artifacts fabric/id-cards
```

#### Delete previously imported composer identities

```
composer card delete -n [cardname]

# If you have already upgraded the composer cli
rm -fr $HOME/.composer 
```

#### Upgrade globally installed composer packages

```
npm uninstall -g composer-cli composer-rest-server
npm i -g composer-cli@next composer-rest-server@next
```

#### Upgrade locally installed composer packages

```
cd composer
npm i composer-admin@next composer-client@next composer-common@next composer-connector-embedded@next
```

#### Repeat the install process

Repeat the process under the 'Fabric' heading above whilst in the `fabric` directory.

It's worth taking a look at the [Composer multi-org install tutorial](https://hyperledger.github.io/composer/next/tutorials/deploy-to-fabric-multi-org) to see if anything has changed since these notes were made. 

E.g. in this case I needed to update the connection profiles to the new format. 

Docker files already use the image tagged with `latest`. Change the name of the `--ca-keyfile` option in the certificate authority definition.