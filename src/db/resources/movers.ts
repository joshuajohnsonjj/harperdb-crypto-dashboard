import { tables, Resource } from 'harperdb';
import { BinanceBaseUrl, BinanceRoutes } from '../../constants/index.js';
import type { BiggestMovers } from '../../types/graphql.js';
import type { BinanceDailyTickerResponse } from '../../types/api.js';
import axios from 'axios';

const { BiggestMovers: MoversTable } = tables;

export class ExternalDailyTickerAPI extends Resource {
	async search(): Promise<BiggestMovers[]> {
		try {
			const tickerResponse = await axios.get(`${BinanceBaseUrl}${BinanceRoutes.DAY_TICKER}`);

			if (tickerResponse.status !== 200) {
				console.log(`Error getting tickers: ${tickerResponse.statusText}`);
				return [];
			}

			const tickers = (tickerResponse.data as BinanceDailyTickerResponse[])
				.map((ticker) => ({
					symbol: ticker.symbol.toLowerCase(),
					lastPrice: parseFloat(ticker.lastPrice),
					change: parseFloat(ticker.priceChange),
					percentChange: parseFloat(ticker.priceChangePercent),
				}))
				.sort((a, b) => a.percentChange - b.percentChange);

			return [...tickers.slice(1, 4), ...tickers.slice(tickers.length - 4, tickers.length - 1)];
		} catch (error) {
			console.log(`Error getting tickers: ${error}`);
			return [];
		}
	}
}

MoversTable.sourcedFrom(ExternalDailyTickerAPI, { expiration: 3600 });
