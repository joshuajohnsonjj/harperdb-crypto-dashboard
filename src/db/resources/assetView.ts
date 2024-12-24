import { Resource } from 'harperdb';
import { join } from 'path';
import ejs from 'ejs';
import { getAssetDetails } from './helper/getAssetDetail.js';
import type { QueryParams } from '../../types/query.js';

export class AssetView extends Resource {
	async get(params: QueryParams) {
		const symbol = params.url.replace('/', '');
		const detail = await getAssetDetails(symbol);

		const html = await ejs.renderFile(join(import.meta.dirname, '../../../templates/asset.ejs'), {
			title: `${detail.asset.name} Detail`,
			symbol,
			detail,
		});

		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: html.replace(
				`<!--app-data-->`,
				`<script>window.__HISTORICAL_DATA__ = ${JSON.stringify(detail.historical)};</script>`
			),
		};
	}
}
