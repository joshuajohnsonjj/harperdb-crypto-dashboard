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
	async get(params: any): Promise<any> {
		try {
			const symbol = params.url.replace('/', '');
			const assetName = await getAssetName(symbol);

			// FIXME:
			const query = new URLSearchParams({
				apikey: 'pub_63003085e3999ffa9d650d914d22fafbdf5bd', //process.env.NEWS_API_KEY!,
				qInMeta: assetName,
				size: '10',
				language: 'en',
				country: 'us',
				image: '1',
				removeduplicate: '1',
			});

			const tickerResponse = await axios.get(`${NewsDataBaseUrl}${NewsDataRoutes.LATEST}?${query}`);

			if (tickerResponse.status !== 200) {
				console.log(`Error getting news: ${tickerResponse.statusText}`);
				return { content: '[]' };
			}

			const stringifiedContent = JSON.stringify(
				tickerResponse.data.results.map((item: NewsAPIResponse) => ({
					url: item.link,
					preview: item.title,
					image: item.image_url,
					date: item.pubDate,
				}))
			);

			return { content: stringifiedContent };
		} catch (error) {
			console.log(`Error getting news: ${error}`);
			return { content: '[]' };
		}
	}
}

AssetNewsTable.sourcedFrom(ExternalNewsAPI, { expiration: 3600 });
