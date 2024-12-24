import type { Asset } from '../../../types/graphql.js';
import { tables } from 'harperdb';

const { Asset: AssetTable } = tables;

export const getAssets = async (): Promise<Asset[]> => {
	const assetsIterator = await AssetTable.get({ limit: 20 });

	const results: Asset[] = [];
	for await (const record of assetsIterator) {
		results.push(record as Asset);
	}

	return results;
};
