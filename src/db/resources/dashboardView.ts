import { Resource, tables } from 'harperdb';
import { join } from 'path';
import { Asset, WatchedAsset } from '../../types/graphql.js';
import ejs from 'ejs';

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

export class Dashboard extends Resource {
	// TODO: get user id from context
	async get() {
		const [assets, watched] = await Promise.all([getAssets(), getWatchedAssets('123-xyz')]);

		const html = await ejs.renderFile(join(import.meta.dirname, '../../../templates/dashboard.ejs'), {
			availableAssets: assets.filter((asset) => !watched[asset.symbol]),
			watchedAssets: Object.values(watched),
		});

		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: html,
		};
	}
}
