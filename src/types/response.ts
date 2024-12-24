import type { Asset, AssetHistoricalPriceData } from './graphql.js';

interface AssetPrice {
	lastPrice: string;
	change: string;
	percentChange: string;
	isNegative: boolean;
}

export interface AssetDetailResponse {
	asset: Asset;
	price: AssetPrice;
	analysis: {
		ema12: string;
		upperBand: string;
		middleBand: string;
		lowerBand: string;
	};
	news: {
		url: string;
		preview: string;
		image: string;
		date: string;
	}[];
	historical: AssetHistoricalPriceData[];
}

export interface BiggestMoversResponse {
	symbol: string;
	change: string;
	percentChange: string;
}

export interface WatchedAssetResponse {
	id: string;
	symbol: string;
	asset: Asset;
	price: AssetPrice;
}
