# Readme

Given a websocket stream with 3 constraints for the client side:

1. A listen key is required to initiate the subscription. This key has to be generated via an API call.
2. The listen key will expire in 1 hr. An API call to declare the need of renewal is required.
3. The server side may disconnect the connection once in 24hrs.

This project (auto-renew-subscription) aims to implement a mechanism to automatically handle those limitations.

### Data Source

[Binance Spot Market User Data Stream](https://binance-docs.github.io/apidocs/spot/en/#user-data-streams)
