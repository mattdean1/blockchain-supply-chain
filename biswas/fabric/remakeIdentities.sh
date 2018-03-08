export FABRIC_CFG_PATH=./config && export CHANNEL_NAME=channel1 && export COMPOSER_PROJECT_NAME=biswas
rm -rf ./id-cards
mkdir ./id-cards

configtxgen -profile GenesisBlockGeneration -outputBlock ./artifacts/channel/genesis.block
configtxgen -profile ChannelCreation -outputCreateChannelTx ./artifacts/channel/channel.tx -channelID $CHANNEL_NAME
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/GrowerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg GrowerMSP
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/ProducerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProducerMSP


composer card delete -n PeerAdmin@biswas-grower
composer card delete -n PeerAdmin@biswas-producer
composer card delete -n grower-network-admin@biswas
composer card delete -n producer-network-admin@biswas


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

./stop.sh
./start.sh

composer identity request -c PeerAdmin@biswas-grower -u admin -s adminpw -d ./id-cards/grower-network-admin
composer card create -p connection-profiles/grower.json -u grower-network-admin -n biswas -c id-cards/grower-network-admin/admin-pub.pem -k id-cards/grower-network-admin/admin-priv.pem -f id-cards/grower-network-admin.card
composer card import -f id-cards/grower-network-admin.card

composer identity request -c PeerAdmin@biswas-producer -u admin -s adminpw -d ./id-cards/producer-network-admin
composer card create -p connection-profiles/producer.json -u producer-network-admin -n biswas -c id-cards/producer-network-admin/admin-pub.pem -k id-cards/producer-network-admin/admin-priv.pem -f id-cards/producer-network-admin.card
composer card import -f id-cards/producer-network-admin.card
