# Composer

### Generate composer boilerplate

(From root directory)

```shell
npx yo hyperledger-composer:businessnetwork
Welcome to the business network generator
? Business network name: composer
? Description: Implementation of the supply chain model proposed by Biswas
? Author name:  Matt Dean
? Author email: mail@mattdean.io
? License: Apache-2.0
? Namespace: org1.biswas.com

cd composer
npm i
```



##Fabric

## Prepare filestructure

(From root directory)

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

```Shell
docker-compose -f docker/docker-compose-cli.yaml up -d
docker ps
docker-compose -f docker/docker-compose-cli.yaml down
```



```
docker exec -it cli bash

peer channel create\
 -o orderer.biswas.com:7050\
 -c channel1\
 -f ./artifacts/channel/channel.tx

peer channel join -b channel1.block
```

