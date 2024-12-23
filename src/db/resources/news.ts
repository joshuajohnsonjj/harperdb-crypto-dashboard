import { tables, Resource } from 'harperdb';
import { NewsDataBaseUrl, NewsDataRoutes } from '../../constants/index.js';
import type { Asset, AssetNews } from '../../types/graphql.js';
import type { NewsAPIResponse } from '../../types/api.js';
import axios from 'axios';

const { AssetNews: AssetNewsTable, Asset: AssetTable } = tables;

const getAssetName = async (symbol: string): Promise<string> => {
  const res = await AssetTable.get(symbol);
  return (res as unknown as Asset).name;
};

export class ExternalNewsAPI extends Resource {
  async get(params: any): Promise<AssetNews[]> {
    try {
      const symbol = params.url;
      const assetName = await getAssetName(symbol);

      const query = new URLSearchParams({
        apikey: process.env.NEWS_API_KEY!,
        qInMeta: assetName,
        size: '10',
        language: 'en',
        country: 'us',
        image: '1',
      });

      const tickerResponse = await axios.get(`${NewsDataBaseUrl}${NewsDataRoutes.LATEST}?${query}`);
      
      if (tickerResponse.status !== 200) {
        console.log(`Error getting news: ${tickerResponse.statusText}`);
        return [];
      }
  
      return tickerResponse.data.results.map((item: NewsAPIResponse) => ({
        symbol,
        url: item.link,
        preview: item.title,
        image: item.image_url,
        date: item.pubDate,
      }));
    } catch (error) {
      console.log(`Error getting news: ${error}`);
      return [];
    }
  }
}

AssetNewsTable.sourcedFrom(ExternalNewsAPI, { expiration: 86400 });
