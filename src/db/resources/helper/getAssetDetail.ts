import { tables } from 'harperdb';
import type {
	Asset,
	AssetHistoricalPriceData,
	AssetLivePriceData,
	AssetNews,
	PriceAnalysis,
} from '../../../types/graphql.js';
import type { AssetDetailResponse } from '../../../types/response.js';

const {
	Asset: AssetTable,
	PriceAnalysis: AnalysisTable,
	AssetNews: NewsTable,
	AssetHistoricalPriceData: HistoricalPriceTable,
	AssetLivePriceData: LivePriceTable,
} = tables;

const dollarFormater = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

export const getAssetDetails = async (symbol: string): Promise<AssetDetailResponse> => {
	const [assetResponse, priceResponse, analysisRsponse, newsResponse, priceHistoryIterator] = await Promise.all([
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

	const price = priceResponse as unknown as AssetLivePriceData;
	const analysis = analysisRsponse as unknown as PriceAnalysis;
	const news = newsResponse as unknown as AssetNews;

	return {
		asset: assetResponse as unknown as Asset,
		price: {
			lastPrice: dollarFormater.format(price.lastPrice),
			change: dollarFormater.format(price.change),
			percentChange: price.percentChange.toFixed(1),
			isNegative: price.change < 0,
		},
		analysis: {
			ema12: dollarFormater.format(analysis.ema12),
			upperBand: dollarFormater.format(analysis.upperBand),
			middleBand: dollarFormater.format(analysis.middleBand),
			lowerBand: dollarFormater.format(analysis.lowerBand),
		},
		news: JSON.parse(news.content),
		historical,
	};
};
