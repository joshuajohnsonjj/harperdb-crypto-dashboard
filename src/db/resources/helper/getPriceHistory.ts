import { tables } from 'harperdb';
import type { AssetHistoricalPriceData } from '../../../types/graphql.js';

const { AssetHistoricalPriceData: HistoricalPriceTable } = tables;

export const getRecentPriceHistory = async (symbol: string): Promise<number[]> => {
	const historicalPriceIterator = await HistoricalPriceTable.get({
		conditions: [
			{
				attribute: 'symbol',
				comparator: 'equals',
				value: symbol,
			},
		],
		limit: 14,
		sort: {
			attribute: 'timestamp',
			descending: true,
		},
		select: ['close'],
	});

	const results: number[] = [];
	for await (const record of historicalPriceIterator) {
		results.push((record as AssetHistoricalPriceData).close);
	}

	return results;
};
