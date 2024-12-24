import { tables, Resource } from 'harperdb';
import { NewsDataBaseUrl, NewsDataRoutes } from '../../constants/index.js';
import type { Asset } from '../../types/graphql.js';
import type { NewsAPIResponse } from '../../types/api.js';
import axios from 'axios';
import type { QueryParams } from '../../types/query.js';

const { AssetNews: AssetNewsTable, Asset: AssetTable } = tables;

const getAssetName = async (symbol: string): Promise<string> => {
	const res = await AssetTable.get(symbol);
	return (res as unknown as Asset).name;
};

const getNews = async (assetName: string): Promise<string> => {
	// FIXME: how to user env vars in harper?????
	const query = new URLSearchParams({
		apikey: process.env.NEWS_API_KEY!,
		qInMeta: assetName,
		size: '10',
		language: 'en',
		country: 'us',
		image: '1',
		removeduplicate: '1',
	});

	const newsResponse = await axios.get(`${NewsDataBaseUrl}${NewsDataRoutes.LATEST}?${query}`);

	if (newsResponse.status !== 200) {
		console.log(`Error getting news: ${newsResponse.statusText}`);
		return '[]';
	}

	return JSON.stringify(
		newsResponse.data.results.map((item: NewsAPIResponse) => ({
			url: item.link,
			preview: item.title,
			image: item.image_url,
			date: item.pubDate,
		}))
	);
};

export class ExternalNewsAPI extends Resource {
	async get(params: QueryParams): Promise<{ content: string }> {
		try {
			const symbol = params.url.replace('/', '');
			const assetName = await getAssetName(symbol);
			const stringifiedNewsContent = await getNews(assetName);

			return { content: stringifiedNewsContent };
		} catch (error) {
			console.log(`Error getting news: ${error}`);
			return { content: '[]' };
		}
	}
}

AssetNewsTable.sourcedFrom(ExternalNewsAPI, { expiration: 3600 });
