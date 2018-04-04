# Compile composer network from source
./compileBusinessNetwork.sh

# Start fabric and create channel
export COMPOSE_PROJECT_NAME=biswas
./restartFabric.sh
docker exec cli /bin/sh "./createChannel.sh"

# Install composer runtime onto peers
composer runtime install -c PeerAdmin@biswas-grower -n biswas
composer runtime install -c PeerAdmin@biswas-producer -n biswas
composer runtime install -c PeerAdmin@biswas-filler -n biswas
composer runtime install -c PeerAdmin@biswas-distributor -n biswas
composer runtime install -c PeerAdmin@biswas-retailer -n biswas

# Install the business network and start it
composer network start\
 -c PeerAdmin@biswas-grower\
 -a composer/biswas.bna\
 -A grower-network-admin\
 -C fabric/id-cards/grower-network-admin/admin-pub.pem\
 -A producer-network-admin\
 -C fabric/id-cards/producer-network-admin/admin-pub.pem\
 -A filler-network-admin\
 -C fabric/id-cards/filler-network-admin/admin-pub.pem\
 -A distributor-network-admin\
 -C fabric/id-cards/distributor-network-admin/admin-pub.pem\
 -A retailer-network-admin\
 -C fabric/id-cards/retailer-network-admin/admin-pub.pem

# Ping network to check it's up
composer network ping -c grower-network-admin@biswas
composer network ping -c producer-network-admin@biswas
composer network ping -c filler-network-admin@biswas
composer network ping -c distributor-network-admin@biswas
composer network ping -c retailer-network-admin@biswas

# Remove unnecessary ID cards created as part of the deploy process
rm ./grower-network-admin@biswas.card
rm ./producer-network-admin@biswas.card
rm ./filler-network-admin@biswas.card
rm ./distributor-network-admin@biswas.card
rm ./retailer-network-admin@biswas.card
