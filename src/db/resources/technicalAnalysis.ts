import { Resource, tables } from 'harperdb';
import { EMA, BollingerBands, RSI } from 'technicalindicators';
import type { PriceAnalysis, AssetHistoricalPriceData } from '../types/graphql.js';
import _ from 'lodash';

const { PriceAnalysis: IndicatorsTable, AssetHistoricalPriceData: HistoricalPriceTable } = tables;

const getRecentPriceHistory = async (
  symbol: string,
): Promise<number[]> => {
  const historicalPriceIterator =
    await HistoricalPriceTable.get({
      conditions: [{
        attribute: 'symbol',
        comparator: 'equals',
        value: symbol
      }],
      limit: 14,
      sort: {
        attribute: 'timestamp',
        descending: true,
      },
      select: ['close']
    });
  
  const results: number[] = [];
  for await (const record of historicalPriceIterator) {
    results.push((record as AssetHistoricalPriceData).close);
  }

  return results;
};

export class PriceWithTechnicalIndicators extends Resource {
  async get(params: any): Promise<PriceAnalysis> {
    const symbol = params.url;
    const priceHistory = await getRecentPriceHistory(symbol);

    const rsi = RSI.calculate({ values: priceHistory, period: 14 });
    const ema12 = EMA.calculate({ values: priceHistory, period: 12 });
    const bbands = BollingerBands.calculate({values: priceHistory, period: 14, stdDev: 2 });
      
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
