composer identity issue -c grower-network-admin@biswas -f ./fabric/id-cards/users/grower.card -u grower1 -a "resource:biswas.grower.GrapeGrower#grower1"
composer card import -f ./fabric/id-cards/users/grower.card -n grower@biswas
composer network ping -c grower@biswas
composer card export -n grower@biswas -f ./fabric/id-cards/users/grower.card

composer identity issue -c producer-network-admin@biswas -f ./fabric/id-cards/users/producer.card -u producer1 -a "resource:biswas.producer.WineProducer#producer1"
composer card import -f ./fabric/id-cards/users/producer.card -n producer@biswas
composer network ping -c producer@biswas
composer card export -n producer@biswas -f ./fabric/id-cards/users/producer.card

composer identity issue -c filler-network-admin@biswas -f ./fabric/id-cards/users/filler.card -u filler1 -a "resource:biswas.filler.Filler#filler1"
composer card import -f ./fabric/id-cards/users/filler.card -n filler@biswas
composer network ping -c filler@biswas
composer card export -n filler@biswas -f ./fabric/id-cards/users/filler.card

composer identity issue -c distributor-network-admin@biswas -f ./fabric/id-cards/users/distributor.card -u distributor1 -a "resource:biswas.distribution.Distributor#distributor1"
composer card import -f ./fabric/id-cards/users/distributor.card -n distributor@biswas
composer network ping -c distributor@biswas
composer card export -n distributor@biswas -f ./fabric/id-cards/users/distributor.card

composer identity issue -c retailer-network-admin@biswas -f ./fabric/id-cards/users/retailer.card -u retailer1 -a "resource:biswas.distribution.Retailer#retailer1"
composer card import -f ./fabric/id-cards/users/retailer.card -n retailer@biswas
composer network ping -c retailer@biswas
composer card export -n retailer@biswas -f ./fabric/id-cards/users/retailer.card
