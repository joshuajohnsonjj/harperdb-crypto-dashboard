import { Resource, tables } from 'harperdb';
import { join } from 'path';
import ejs from 'ejs';
import { getAssets } from './helper/listAssets.js';
import { getWatchedAssets } from './helper/listWatchedAssets.js';
import { getBiggestMovers } from './helper/listBiggestMovers.js';

export class Dashboard extends Resource {
	async get() {
		const [assets, watched, movers] = await Promise.all([getAssets(), getWatchedAssets('123-xyz'), getBiggestMovers()]);

		const html: string = await ejs.renderFile(join(import.meta.dirname, '../../../templates/dashboard.ejs'), {
			availableAssets: assets.filter((asset) => !watched[asset.symbol]),
			watchedAssets: Object.values(watched),
			...movers,
		});

		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: html.replace(
				`<!--app-data-->`,
				`<script>window.__WATCH_LIST__ = ${JSON.stringify(Object.keys(watched))};</script>`
			),
		};
	}
}
