import { Resource, tables } from 'harperdb';
import { join } from 'path';
import { Asset, BiggestMovers, WatchedAsset } from '../../types/graphql.js';
import ejs from 'ejs';
import axios from 'axios';
import { BinanceBaseUrl, BinanceRoutes } from '../../constants/index.js';
import { BinanceDailyTickerResponse } from '../../types/api.js';

const { Asset: AssetTable, WatchedAsset: WatchedAssetTable } = tables;

const getAssets = async (): Promise<Asset[]> => {
	const assetsIterator = await AssetTable.get({ limit: 20 });

	const results: Asset[] = [];
	for await (const record of assetsIterator) {
		results.push(record as Asset);
	}

	return results;
};

const getWatchedAssets = async (userId: string): Promise<{ [symbol: string]: any }> => {
	const assetsIterator = await WatchedAssetTable.get({
		conditions: [
			{
				attribute: 'userId',
				comparator: 'equals',
				value: userId,
			},
		],
		limit: 20,
		select: [
			'symbol',
			{
				name: 'asset',
				select: ['name', 'symbolUrl'],
			},
			{
				name: 'price',
				select: ['lastPrice', 'change', 'percentChange'],
			},
		],
	});

	const dollarFormater = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	});

	const results: { [symbol: string]: any } = {};
	for await (const record of assetsIterator) {
		const watched = record as any;
		results[watched.symbol] = {
			...watched,
			price: {
				lastPrice: dollarFormater.format(watched.price!.lastPrice),
				change: dollarFormater.format(watched.price!.change),
				percentChange: watched.price!.percentChange.toFixed(1),
				isNegative: watched.price!.change < 0,
			},
		};
	}

	return results;
};

const getBiggestMovers = async (): Promise<any> => {
	const tickerResponse = await axios.get(`${BinanceBaseUrl}${BinanceRoutes.DAY_TICKER}`);

	if (tickerResponse.status !== 200) {
		console.log(`Error getting tickers: ${tickerResponse.statusText}`);
		return { biggestGainers: [], biggestLosers: [] };
	}

	const tickers = (tickerResponse.data as BinanceDailyTickerResponse[])
		.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
		.map((ticker) => ({
			symbol: ticker.symbol,
			change: parseFloat(ticker.priceChange).toFixed(2),
			percentChange: parseFloat(ticker.priceChangePercent).toFixed(1),
		}));

	return { biggestLosers: tickers.slice(1, 4), biggestGainers: tickers.slice(tickers.length - 4, tickers.length - 1) };
};

export class Dashboard extends Resource {
	// TODO: get user id from context
	async get() {
		const [assets, watched, movers] = await Promise.all([getAssets(), getWatchedAssets('123-xyz'), getBiggestMovers()]);

		const html: string = await ejs.renderFile(join(import.meta.dirname, '../../../templates/dashboard.ejs'), {
			availableAssets: assets.filter((asset) => !watched[asset.symbol]),
			watchedAssets: Object.values(watched),
			...movers,
		});

		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: html.replace(
				`<!--app-data-->`,
				`<script>window.__WATCH_LIST__ = ${JSON.stringify(Object.keys(watched))};</script>`
			),
		};
	}
}
