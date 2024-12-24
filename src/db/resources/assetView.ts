import { Resource, tables } from 'harperdb';
import { join } from 'path';
import ejs from 'ejs';
import { Asset, AssetHistoricalPriceData, AssetNews, PriceAnalysis } from '../../types/graphql.js';

const {
	Asset: AssetTable,
	PriceAnalysis: AnalysisTable,
	AssetNews: NewsTable,
	AssetHistoricalPriceData: HistoricalPriceTable,
	AssetLivePriceData: LivePriceTable,
} = tables;

const getAssetDetails = async (symbol: string) => {
	const [asset, price, analysis, news, priceHistoryIterator] = await Promise.all([
		AssetTable.get({ id: symbol, select: ['name', 'symbolUrl'] }),
		LivePriceTable.get({ id: symbol, select: ['lastPrice', 'change', 'percentChange'] }),
		AnalysisTable.get({ id: symbol, select: ['ema12', 'upperBand', 'middleBand', 'lowerBand', 'rsi'] }),
		NewsTable.get({
			conditions: [
				{
					attribute: 'symbol',
					comparator: 'equals',
					value: symbol,
				},
			],
			limit: 10,
		}),
		HistoricalPriceTable.get({
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
		}),
	]);

	const historical: AssetHistoricalPriceData[] = [];
	for await (const record of priceHistoryIterator) {
		historical.push(record as AssetHistoricalPriceData);
	}

	// const newsList: any[] = [];
	for await (const record of news) {
		console.log(record);
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
			rsi: dollarFormater.format((analysis as any)?.rsi ?? 0),
		},
		news: [], //news as unknown as AssetNews,
		historical,
	};
};

export class AssetView extends Resource {
	async get(params: any) {
		const symbol = params.url.replace('/', '');
		const detail = await getAssetDetails(symbol);

		const html = await ejs.renderFile(join(import.meta.dirname, '../../../templates/asset.ejs'), {
			title: `${detail.asset.name} Detail`,
			symbol,
			detail,
		});

		console.log({
			title: `${detail.asset.name} Detail`,
			symbol,
			detail,
		});

		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: html,
		};
	}
}
