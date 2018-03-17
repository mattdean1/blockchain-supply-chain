export FABRIC_CFG_PATH=./config && export CHANNEL_NAME=channel1 && export COMPOSER_PROJECT_NAME=biswas
rm -rf ./id-cards
mkdir ./id-cards

configtxgen -profile GenesisBlockGeneration -outputBlock ./artifacts/channel/genesis.block
configtxgen -profile ChannelCreation -outputCreateChannelTx ./artifacts/channel/channel.tx -channelID $CHANNEL_NAME
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/GrowerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg GrowerMSP
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/ProducerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProducerMSP
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/FillerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg FillerMSP
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/DistributorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg DistributorMSP
configtxgen -profile ChannelCreation -outputAnchorPeersUpdate ./artifacts/channel/RetailerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg RetailerMSP

echo "Deleting old ID cards, these commands may fail"
composer card delete -n PeerAdmin@biswas-grower
composer card delete -n PeerAdmin@biswas-producer
composer card delete -n PeerAdmin@biswas-filler
composer card delete -n PeerAdmin@biswas-distributor
composer card delete -n PeerAdmin@biswas-retailer
composer card delete -n grower-network-admin@biswas
composer card delete -n producer-network-admin@biswas
composer card delete -n filler-network-admin@biswas
composer card delete -n distributor-network-admin@biswas
composer card delete -n retailer-network-admin@biswas

echo "Creating new cards"
composer card create\
 -p connection-profiles/grower.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-grower.card\
 -k ./artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp/keystore/762b9887ca8cca5081374b83515681e74dff4388ce0f3b378850dc62b1cd3768_sk\
 -c ./artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp/signcerts/Admin@grower.biswas.com-cert.pem

 composer card import -f ./id-cards/PeerAdmin@biswas-grower.card

 composer card create\
 -p connection-profiles/producer.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-producer.card\
 -k ./artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp/keystore/65cc1611d135768a94569e212adeaba365fa5234eb333b022da38f341a9b8391_sk\
 -c ./artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp/signcerts/Admin@producer.biswas.com-cert.pem

 composer card import -f ./id-cards/PeerAdmin@biswas-producer.card

 composer card create\
 -p connection-profiles/filler.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-filler.card\
 -k ./artifacts/certs/peerOrganizations/filler.biswas.com/users/Admin@filler.biswas.com/msp/keystore/faece40c3a4f19f0e3a0b27b9c9da2d8f7ceb087af9e29e89412ea9c9d6497a6_sk\
 -c ./artifacts/certs/peerOrganizations/filler.biswas.com/users/Admin@filler.biswas.com/msp/signcerts/Admin@filler.biswas.com-cert.pem

 composer card import -f ./id-cards/PeerAdmin@biswas-filler.card

 composer card create\
 -p connection-profiles/distributor.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-distributor.card\
 -k ./artifacts/certs/peerOrganizations/distributor.biswas.com/users/Admin@distributor.biswas.com/msp/keystore/235fd530ecfe674657c84e448618ca02562eb8869c5322a3bddd5e271695030b_sk\
 -c ./artifacts/certs/peerOrganizations/distributor.biswas.com/users/Admin@distributor.biswas.com/msp/signcerts/Admin@distributor.biswas.com-cert.pem

 composer card import -f ./id-cards/PeerAdmin@biswas-distributor.card

 composer card create\
 -p connection-profiles/retailer.json\
 -u PeerAdmin\
 -r PeerAdmin -r ChannelAdmin\
 -f ./id-cards/PeerAdmin@biswas-retailer.card\
 -k ./artifacts/certs/peerOrganizations/retailer.biswas.com/users/Admin@retailer.biswas.com/msp/keystore/78d2e3b75c364b3abed9f2ee9c0f254c5da8b9ce6c83993f24f4ac5d8be5a38e_sk\
 -c ./artifacts/certs/peerOrganizations/retailer.biswas.com/users/Admin@retailer.biswas.com/msp/signcerts/Admin@retailer.biswas.com-cert.pem

 composer card import -f ./id-cards/PeerAdmin@biswas-retailer.card

./stop.sh
./start.sh

composer identity request -c PeerAdmin@biswas-grower -u admin -s adminpw -d ./id-cards/grower-network-admin
composer card create -p connection-profiles/grower.json -u grower-network-admin -n biswas -c id-cards/grower-network-admin/admin-pub.pem -k id-cards/grower-network-admin/admin-priv.pem -f id-cards/grower-network-admin.card
composer card import -f id-cards/grower-network-admin.card

composer identity request -c PeerAdmin@biswas-producer -u admin -s adminpw -d ./id-cards/producer-network-admin
composer card create -p connection-profiles/producer.json -u producer-network-admin -n biswas -c id-cards/producer-network-admin/admin-pub.pem -k id-cards/producer-network-admin/admin-priv.pem -f id-cards/producer-network-admin.card
composer card import -f id-cards/producer-network-admin.card

composer identity request -c PeerAdmin@biswas-filler -u admin -s adminpw -d ./id-cards/filler-network-admin
composer card create -p connection-profiles/filler.json -u filler-network-admin -n biswas -c id-cards/filler-network-admin/admin-pub.pem -k id-cards/filler-network-admin/admin-priv.pem -f id-cards/filler-network-admin.card
composer card import -f id-cards/filler-network-admin.card

composer identity request -c PeerAdmin@biswas-distributor -u admin -s adminpw -d ./id-cards/distributor-network-admin
composer card create -p connection-profiles/distributor.json -u distributor-network-admin -n biswas -c id-cards/distributor-network-admin/admin-pub.pem -k id-cards/distributor-network-admin/admin-priv.pem -f id-cards/distributor-network-admin.card
composer card import -f id-cards/distributor-network-admin.card

composer identity request -c PeerAdmin@biswas-retailer -u admin -s adminpw -d ./id-cards/retailer-network-admin
composer card create -p connection-profiles/retailer.json -u retailer-network-admin -n biswas -c id-cards/retailer-network-admin/admin-pub.pem -k id-cards/retailer-network-admin/admin-priv.pem -f id-cards/retailer-network-admin.card
composer card import -f id-cards/retailer-network-admin.card
