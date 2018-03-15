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

composer-rest-server -c grower-network-admin@biswas -a true -m true
```

The API explorer is located at http://localhost:3000/explorer  - any request should initially fail with `401 Unauthorized` - make sure to logout.

- Revoke all user tokens at https://github.com/settings/applications/685013


- Navigate to http://localhost:3000/auth/github and authenticate with GitHub


- Import the identity cards for a network admin (name: admin) and the WineProducer (name: producer) with `/wallet/import`
- Update auth token in postman
- Run the postman collection which adds the test data

Now we can see the results of the named queries.