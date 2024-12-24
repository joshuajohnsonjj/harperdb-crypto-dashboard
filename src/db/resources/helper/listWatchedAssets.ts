import { tables } from 'harperdb';

const { WatchedAsset: WatchedAssetTable } = tables;

// FIXME: any type
export const getWatchedAssets = async (userId: string): Promise<{ [symbol: string]: any }> => {
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
			'id',
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

	// FIXME: any type
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
