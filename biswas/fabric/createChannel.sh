echo "Creating channel"
CORE_PEER_ADDRESS=peer0.grower.biswas.com:7051
CORE_PEER_LOCALMSPID=GrowerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp

peer channel create -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/channel.tx

echo "Joining peers"
peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.grower.biswas.com:7051
peer channel join -b channel1.block

CORE_PEER_LOCALMSPID=ProducerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp
CORE_PEER_ADDRESS=peer0.producer.biswas.com:7051
peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.producer.biswas.com:7051
peer channel join -b channel1.block

echo "Updating anchor peers"
CORE_PEER_LOCALMSPID=GrowerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp
CORE_PEER_ADDRESS=peer0.grower.biswas.com:7051
peer channel update -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/GrowerMSPanchors.tx

CORE_PEER_LOCALMSPID=ProducerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/producer.biswas.com/users/Admin@producer.biswas.com/msp
CORE_PEER_ADDRESS=peer0.producer.biswas.com:7051
peer channel update -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/ProducerMSPanchors.tx
