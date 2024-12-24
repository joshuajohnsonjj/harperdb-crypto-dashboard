import { tables } from 'harperdb';
import type { Asset, AssetHistoricalPriceData } from '../../../types/graphql.js';
import type { AssetDetailResponse } from '../../../types/response.js';

const {
	Asset: AssetTable,
	PriceAnalysis: AnalysisTable,
	AssetNews: NewsTable,
	AssetHistoricalPriceData: HistoricalPriceTable,
	AssetLivePriceData: LivePriceTable,
} = tables;

export const getAssetDetails = async (symbol: string): Promise<AssetDetailResponse> => {
	const [asset, price, analysis, news, priceHistoryIterator] = await Promise.all([
		AssetTable.get({ id: symbol, select: ['name', 'symbolUrl'] }),
		LivePriceTable.get({ id: symbol, select: ['lastPrice', 'change', 'percentChange'] }),
		AnalysisTable.get({ id: symbol, select: ['ema12', 'upperBand', 'middleBand', 'lowerBand'] }),
		NewsTable.get({ id: symbol, select: ['content'] }),
		HistoricalPriceTable.get({
			conditions: [
				{
					attribute: 'symbol',
					comparator: 'equals',
					value: symbol,
				},
			],
			limit: 365,
			select: ['close'],
			sort: {
				attribute: 'timestamp',
				descending: true,
			},
		}),
	]);

	const historical: AssetHistoricalPriceData[] = [];
	for await (const record of priceHistoryIterator) {
		historical.push(record as AssetHistoricalPriceData);
	}

	const dollarFormater = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	});

	return {
		asset: asset as unknown as Asset,
		price: {
			lastPrice: dollarFormater.format((price as any).lastPrice),
			change: dollarFormater.format((price as any).change),
			percentChange: (price as any).percentChange.toFixed(1),
			isNegative: (price as any).change < 0,
		},
		analysis: {
			ema12: dollarFormater.format((analysis as any).ema12),
			upperBand: dollarFormater.format((analysis as any).upperBand),
			middleBand: dollarFormater.format((analysis as any).middleBand),
			lowerBand: dollarFormater.format((analysis as any).lowerBand),
		},
		news: JSON.parse((news as any).content),
		historical,
	};
};
