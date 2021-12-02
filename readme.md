# Readme

Given a websocket stream with 3 constraints for the client side:

1. A listen key is required to initiate the subscription. This key has to be generated via an API call.
2. The listen key will expire in 1 hr. An API call to declare the need of renewal is required.
3. The server side may disconnect the connection once in 24hrs.

This project (auto-renew-subscription) aims to implement a mechanism to automatically handle those limitations.

### Data Source

[Binance Spot Market User Data Stream](https://binance-docs.github.io/apidocs/spot/en/#user-data-streams)

### Getting Started

Before turn on the terminal, copy `config.sample.json` and rename it to `config.json`. After the new config file is created, fill in the api key. If the subscription target is testnet environment, the url for API and websocket should be changed. Please refer to the API document for the corresponding url.

```
npm install
node --experimental-json-modules src/index.js
```

The option to enable the experimental feature is required since the config file is written in json format.

### Data Storage

There are 4 types of events receivable: `outboundAccountPosition`, `balanceUpdate`, `executionReport`, and `listStatus` (if OCO orders are involved).

It is known that even the same event type may have different object properties due to the difference on the order type. So to ensure the smooth data transition, schemaless noSQL DB may be a good choice for data storage.

#### Collections

The following collections store the records from the stream without modification involved.

1. accountUpdates -- handles `outboundAccountPosition` event
2. balanceUpdates -- handles `balanceUpdate` event
3. orderUpdates -- handles `executionReport` and `listStatus` event

In addition, there is another collection, `accountStatus`, handling the latest account status.

```
{
	"asset": "ETH",
	"amount": 1,
	"averageEntryPriceBUSD": 4102.782,
	"lastUpdateTime": 1637582145000
}
```

### Limitation => TO-DO

So far the accountStatus update feature only supports the symbol which has the quote asset equals BUSD. The future enhancement could be including other quote assets.
