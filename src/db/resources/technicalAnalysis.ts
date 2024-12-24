import { Resource, tables } from 'harperdb';
import { EMA, BollingerBands, RSI } from 'technicalindicators';
import type { PriceAnalysis } from '../../types/graphql.js';
import _ from 'lodash';
import { getRecentPriceHistory } from './helper/getPriceHistory.js';
import type { QueryParams } from '../../types/query.js';

const { PriceAnalysis: IndicatorsTable } = tables;

export class PriceWithTechnicalIndicators extends Resource {
	async get(params: QueryParams): Promise<PriceAnalysis> {
    const symbol = params.url.replace('/', '');
		const priceHistory = await getRecentPriceHistory(symbol);

		const rsi = RSI.calculate({ values: priceHistory, period: 14 });
		const ema12 = EMA.calculate({ values: priceHistory, period: 12 });
		const bbands = BollingerBands.calculate({ values: priceHistory, period: 14, stdDev: 2 });

		return {
			symbol: symbol,
			rsi: _.last(rsi)!,
			ema12: _.last(ema12)!,
			upperBand: _.last(bbands)!.upper,
			middleBand: _.last(bbands)!.middle,
			lowerBand: _.last(bbands)!.lower,
		};
	}
}

IndicatorsTable.sourcedFrom(PriceWithTechnicalIndicators, { expiration: 3600 });
