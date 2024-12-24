import axios from 'axios';
import { BinanceBaseUrl, BinanceRoutes } from '../../../constants/index.js';
import type { BinanceDailyTickerResponse } from '../../../types/api.js';
import type { BiggestMoversResponse } from '../../../types/response.js';

export const getBiggestMovers = async (): Promise<{
	biggestGainers: BiggestMoversResponse[];
	biggestLosers: BiggestMoversResponse[];
}> => {
	const tickerResponse = await axios.get(`${BinanceBaseUrl}${BinanceRoutes.DAY_TICKER}`);

	if (tickerResponse.status !== 200) {
		console.log(`Error getting tickers: ${tickerResponse.statusText}`);
		return { biggestGainers: [], biggestLosers: [] };
	}

	const tickers = (tickerResponse.data as BinanceDailyTickerResponse[])
		.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
		.map((ticker) => ({
			symbol: ticker.symbol,
			change: parseFloat(ticker.priceChange).toFixed(4),
			percentChange: parseFloat(ticker.priceChangePercent).toFixed(1),
		}));

	return { biggestLosers: tickers.slice(1, 4), biggestGainers: tickers.slice(tickers.length - 4, tickers.length - 1) };
};
