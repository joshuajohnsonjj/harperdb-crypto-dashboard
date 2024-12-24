import axios from 'axios';
import WebSocket from 'ws';
import type { AssetLivePriceData } from '../types/graphql.js';
import { TableNames } from '../constants/index.js';

const streams = [
	'btcusdt@ticker',
	'ethusdt@ticker',
	'solusdt@ticker',
	'xrpusdt@ticker',
	'dogeusdt@ticker',
	'adausdt@ticker',
	'linkusdt@ticker',
	'avaxusdt@ticker',
	'dotusdt@ticker',
];

const wsClient = new WebSocket(`wss://stream.binance.us:9443/stream?streams=${streams.join('/')}`);
const harperAuth = Buffer.from(`${process.env.HARPERDB_USERNAME}:${process.env.HARPERDB_PASSWORD}`).toString('base64');

let cache: { [symbol: string]: AssetLivePriceData } = {};

// Flush results every 5 seconds
setInterval(async () => {
	const records = Object.values(cache);

	if (records.length === 0) {
		return;
	}

	cache = {};

	await axios.post(
		process.env.HARPERDB_OPERATIONS_HOST!,
		{
			operation: 'upsert',
			database: process.env.HARPERDB_DATABASE,
			table: TableNames.LIVE_PRICE,
			records,
		},
		{
			headers: {
				'Authorization': `Basic ${harperAuth}`,
				'Content-Type': 'application/json',
			},
		}
	);
}, 5000);

wsClient.on('open', () => {
	console.log('Connected to Binance!');
});
wsClient.on('close', () => {
	console.log('Connection closed');
});
wsClient.on('error', console.error);

wsClient.on('message', (rawData) => {
	const data = JSON.parse(rawData.toString());

	cache[data.data.s] = {
		symbol: data.data.s.toLowerCase(),
		open: parseFloat(data.data.o),
		high: parseFloat(data.data.h),
		low: parseFloat(data.data.l),
		lastPrice: parseFloat(data.data.c),
		volume: parseFloat(data.data.q),
		change: parseFloat(data.data.p),
		percentChange: parseFloat(data.data.P),
		bidPrice: parseFloat(data.data.b),
		askPrice: parseFloat(data.data.a),
	};
});

wsClient.on('ping', () => {
	wsClient.pong();
});
