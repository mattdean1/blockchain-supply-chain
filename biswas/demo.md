### Unit tests

```
cd composer
npm t
```



### Playground

[Composer Playground](https://composer-playground.mybluemix.net/)



### REST API

```
export COMPOSER_PROVIDERS='{
  "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "REPLACE_WITH_CLIENT_ID",
    "clientSecret": "REPLACE_WITH_CLIENT_SECRET",
    "authPath": "/auth/github",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "/",
    "failureRedirect": "/"
  }
}'

composer-rest-server -c grower-network-admin@biswas -n always -w true -a true -m true
```

The API explorer is located at http://localhost:3000/explorer .Any request should initially fail with `401 Unauthorized`.

Navigate to http://localhost:3000/auth/github and authenticate with GitHub.

- Import the identity card for a network admin  with `/wallet/import`.
- Update auth token in postman then use prebuilt requests to add the test data. (up to add grapes)
- Issue a new identity for the producer via `/system/identities/issue`

```json
{
  "participant": "resource:biswas.producer.WineProducer#producer1",
  "userID": "producer",
  "options": {}
}
```

```
{
  "participant": "resource:biswas.producer.WineProducer#producer1",
  "certificate": "-----BEGIN CERTIFICATE-----MIICezCCAiGgAwIBAgIUYyow3D0ksN6ta93O9NbDU5jruD4wCgYIKoZIzj0EAwIweTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28xHDAaBgNVBAoTE3Byb2R1Y2VyLmJpc3dhcy5jb20xHzAdBgNVBAMTFmNhLnByb2R1Y2VyLmJpc3dhcy5jb20wHhcNMTgwMzE0MTcyNDAwWhcNMTkwMzE0MTcyOTAwWjAxMRwwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMREwDwYDVQQDEwhwcm9kdWNlcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJrw9mx91IfCyKmRaEvz9FDDSDMA78I8Y0wo2aVaK748rujHEz8Lf+LEYieGwV9N1Glrg/gwHDFhYSMld96Fqeejgc4wgcswDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNfpoH7wnG3dCpPoxow2KC7p8ZIlMCsGA1UdIwQkMCKAIAvTXTD3SgHrOW0pOtltW2i6p/LfRT9MBdBVaWoBXGgrMF8GCCoDBAUGBwgBBFN7ImF0dHJzIjp7ImhmLkFmZmlsaWF0aW9uIjoib3JnMSIsImhmLkVucm9sbG1lbnRJRCI6InByb2R1Y2VyIiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAKBggqhkjOPQQDAgNIADBFAiEA/MVOdl1J6ekTz93jer4Qbpnj1hEkIIcVamGITXTq2KoCIAve0/Pp5Yq7tVv/v/0QMr8A8r3tYQHoMYBsPmtu+sYC-----END CERTIFICATE-----"
}
```



- Download the identity card returned and import it with `/wallet/import` using name `producer`
- Use postman to submit a createwine tx



### Test Data

##### Vineyard

```json
{
    "$class": "biswas.grower.Vineyard",
    "vineyardId": "vineyard1",
    "location": {
        "$class": "biswas.grower.Location",
        "latitude": 102.857,
        "longitude": 81.737
    },
    "altitude": 45644
}
```

##### GrapeGrower

```json
{
    "$class": "biswas.grower.GrapeGrower",
    "vineyards": [
        "resource:biswas.grower.Vineyard#vineyard1"
    ],
    "companyName": "grower1",
    "email": "test@example.com"
}
```

##### WineProducer

```json
{
  "$class": "biswas.producer.WineProducer",
  "companyName": "producer1",
  "email": "test@example.com"
}
```

##### Grapes

```json
# Playground
{
  "$class": "biswas.grower.Grapes",
  "species": "red",
  "harvestDate": "2018-03-13T15:55:42.272Z",
  "vineyard": "resource:biswas.grower.Vineyard#vineyard1",
  "grapeGrower": "resource:biswas.grower.GrapeGrower#grower1",
  "batchId": "grapes1",
  "quantity": 1000,
  "owner": "resource:biswas.grower.GrapeGrower#grower1"
}

# API
{
  "$class": "biswas.grower.Grapes",
  "species": "red",
  "harvestDate": "2018-03-13T15:55:42.272Z",
  "vineyard": "resource:biswas.grower.Vineyard#vineyard1",
  "grapeGrower": "resource:biswas.grower.GrapeGrower#grower1",
  "batchId": "grapes1",
  "quantity": 1000,
  "owner": "resource:biswas.producer.WineProducer#producer1"
}
```

##### BulkWine

```json
# API
{
  "$class": "biswas.producer.BulkWine",
  "year": 2018,
  "grapes": "resource:biswas.grower.Grapes#grapes1",
  "producer": "resource:biswas.producer.WineProducer#producer1",
  "batchId": "wine1",
  "quantity": 500,
  "owner": "resource:biswas.producer.WineProducer#producer1"
}
```

