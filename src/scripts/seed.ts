import axios from 'axios';
import { BinanceBaseUrl, BinanceRoutes, TableNames } from '../constants/index.js';
import { COINS } from './coins.js';

const BASIC_AUTH = Buffer.from(`${process.env.HARPERDB_USERNAME}:${process.env.HARPERDB_PASSWORD}`).toString('base64');

const HEADERS = {
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Basic ${BASIC_AUTH}`,
	},
};

const UPSERT_OPERATION = 'upsert';

const run = async () => {
	const userId = '123-xyz';
	const userResp = await axios.post(
		process.env.HARPERDB_OPERATIONS_HOST!,
		{
			operation: UPSERT_OPERATION,
			database: process.env.HARPERDB_DATABASE,
			table: TableNames.USER,
			records: [
				{
					id: userId,
					name: 'John Doe',
				},
			],
		},
		HEADERS
	);

	console.log('Seeded users', userResp.data);

	const assetResp = await axios.post(
		process.env.HARPERDB_OPERATIONS_HOST!,
		{
			operation: UPSERT_OPERATION,
			database: process.env.HARPERDB_DATABASE,
			table: TableNames.ASSET,
			records: COINS,
		},
		HEADERS
	);

	console.log('Seeded assets', assetResp.data);

	const watchedResp = await axios.post(
		process.env.HARPERDB_OPERATIONS_HOST!,
		{
			operation: UPSERT_OPERATION,
			database: process.env.HARPERDB_DATABASE,
			table: TableNames.WATCHED_ASSET,
			records: [
				{
					id: `${COINS[0].symbol}-${userId}`,
					userId: userId,
					symbol: COINS[0].symbol,
				},
				{
					id: `${COINS[1].symbol}-${userId}`,
					userId: userId,
					symbol: COINS[1].symbol,
				},
			],
		},
		HEADERS
	);

	console.log('Seeded watched assets', watchedResp.data);

	await Promise.all(
		COINS.map(async (coin) => {
			console.log('Retrieving asset candles data: ', coin.symbol);

			const candlesResp = await axios.get(
				`${BinanceBaseUrl}${BinanceRoutes.CANDLES}?symbol=${coin.symbol.toUpperCase()}&interval=1d&limit=365`
			);
			const historyData = candlesResp.data.map((candle: any, index: number) => ({
				id: `${coin.symbol}-${index}`,
				symbol: coin.symbol,
				open: parseFloat(candle[1]),
				high: parseFloat(candle[2]),
				low: parseFloat(candle[3]),
				close: parseFloat(candle[4]),
				volume: parseFloat(candle[7]),
				timestamp: candle[6].toString(),
			}));

			await axios.post(
				process.env.HARPERDB_OPERATIONS_HOST!,
				{
					operation: UPSERT_OPERATION,
					database: process.env.HARPERDB_DATABASE,
					table: TableNames.HISTORICAL_PRICE,
					records: historyData,
				},
				HEADERS
			);

			console.log(`Seeded ${historyData.length} candles for ${coin.symbol}`);
		})
	);

	console.log('Done seeding candles data');
};

run();
