export const BinanceBaseUrl = 'https://binance.us/';

export enum BinanceRoutes {
	DAY_TICKER = 'api/v3/ticker/24hr',
	CANDLES = 'api/v3/klines',
}

export const NewsDataBaseUrl = 'https://newsdata.io/';

export enum NewsDataRoutes {
	LATEST = 'api/1/latest',
}

export enum TableNames {
	LIVE_PRICE = 'AssetLivePriceData',
	USER = 'User',
	ASSET = 'Asset',
	WATCHED_ASSET = 'WatchedAsset',
	HISTORICAL_PRICE = 'AssetHistoricalPriceData',
}
