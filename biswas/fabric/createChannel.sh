echo "Creating channel"
CORE_PEER_ADDRESS=peer0.grower.biswas.com:7051
CORE_PEER_LOCALMSPID=GrowerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/grower.biswas.com/users/Admin@grower.biswas.com/msp

peer channel create -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/channel.tx

sleep 20

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


CORE_PEER_LOCALMSPID=FillerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/filler.biswas.com/users/Admin@filler.biswas.com/msp
CORE_PEER_ADDRESS=peer0.filler.biswas.com:7051
peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.filler.biswas.com:7051
peer channel join -b channel1.block


CORE_PEER_LOCALMSPID=DistributorMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/distributor.biswas.com/users/Admin@distributor.biswas.com/msp
CORE_PEER_ADDRESS=peer0.distributor.biswas.com:7051
peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.distributor.biswas.com:7051
peer channel join -b channel1.block


CORE_PEER_LOCALMSPID=RetailerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/retailer.biswas.com/users/Admin@retailer.biswas.com/msp
CORE_PEER_ADDRESS=peer0.retailer.biswas.com:7051
peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.retailer.biswas.com:7051
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

CORE_PEER_LOCALMSPID=FillerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/filler.biswas.com/users/Admin@filler.biswas.com/msp
CORE_PEER_ADDRESS=peer0.filler.biswas.com:7051
peer channel update -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/FillerMSPanchors.tx

CORE_PEER_LOCALMSPID=DistributorMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/distributor.biswas.com/users/Admin@distributor.biswas.com/msp
CORE_PEER_ADDRESS=peer0.distributor.biswas.com:7051
peer channel update -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/DistributorMSPanchors.tx

CORE_PEER_LOCALMSPID=RetailerMSP
CORE_PEER_MSPCONFIGPATH=/opt/gopath/artifacts/certs/peerOrganizations/retailer.biswas.com/users/Admin@retailer.biswas.com/msp
CORE_PEER_ADDRESS=peer0.retailer.biswas.com:7051
peer channel update -o orderer.biswas.com:7050 -c channel1 -f ./artifacts/channel/RetailerMSPanchors.tx
