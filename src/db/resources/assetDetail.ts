import { tables, Resource } from 'harperdb';
import type { AssetDetailResponse } from '../types/response.js';
import type { Asset, AssetHistoricalPriceData, AssetNews, PriceAnalysis } from '../types/graphql.js';

const {
  Asset: AssetTable,
  PriceAnalysis: AnalysisTable,
  AssetNews: NewsTable,
  AssetHistoricalPriceData: HistoricalPriceTable,
} = tables;

export class AssetDetail extends Resource {
  async get(params: any): Promise<AssetDetailResponse> {
    const symbol = params.url;
      
    const [
      asset,
      analysis,
      news,
      priceHistoryIterator,
    ] = await Promise.all([
      AssetTable.get(symbol),
      AnalysisTable.get(symbol),
      NewsTable.get(symbol),
      HistoricalPriceTable.get({ // TODO: probably break this out and have it do diff time ranges
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
      }),
    ]);

    const historical: AssetHistoricalPriceData[] = [];
    for await (const record of priceHistoryIterator) {
      historical.push(record as AssetHistoricalPriceData);
    }

    return {
      asset: asset as unknown as Asset,
      analysis: analysis as unknown as PriceAnalysis,
      news: news as unknown as AssetNews,
      historical,
    }
  }
}
