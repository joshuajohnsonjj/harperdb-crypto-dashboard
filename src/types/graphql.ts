export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
};

export type Asset = {
	__typename?: 'Asset';
	name: Scalars['String']['output'];
	symbol: Scalars['String']['output'];
	symbolUrl: Scalars['String']['output'];
};

export type AssetHistoricalPriceData = {
	__typename?: 'AssetHistoricalPriceData';
	asset?: Maybe<Asset>;
	close: Scalars['Float']['output'];
	high: Scalars['Float']['output'];
	id: Scalars['String']['output'];
	low: Scalars['Float']['output'];
	open: Scalars['Float']['output'];
	symbol: Scalars['String']['output'];
	timestamp: Scalars['String']['output'];
	volume: Scalars['Float']['output'];
};

export type AssetLivePriceData = {
	__typename?: 'AssetLivePriceData';
	askPrice: Scalars['Float']['output'];
	asset?: Maybe<Asset>;
	bidPrice: Scalars['Float']['output'];
	change: Scalars['Float']['output'];
	high: Scalars['Float']['output'];
	lastPrice: Scalars['Float']['output'];
	low: Scalars['Float']['output'];
	open: Scalars['Float']['output'];
	percentChange: Scalars['Float']['output'];
	symbol: Scalars['String']['output'];
	volume: Scalars['Float']['output'];
};

export type AssetNews = {
	__typename?: 'AssetNews';
	date: Scalars['String']['output'];
	id: Scalars['ID']['output'];
	image: Scalars['String']['output'];
	preview: Scalars['String']['output'];
	symbol: Scalars['String']['output'];
	url: Scalars['String']['output'];
};

export type BiggestMovers = {
	__typename?: 'BiggestMovers';
	change: Scalars['Float']['output'];
	lastPrice: Scalars['Float']['output'];
	percentChange: Scalars['Float']['output'];
	symbol: Scalars['String']['output'];
};

export type PriceAnalysis = {
	__typename?: 'PriceAnalysis';
	ema12: Scalars['Float']['output'];
	lowerBand: Scalars['Float']['output'];
	middleBand: Scalars['Float']['output'];
	rsi: Scalars['Float']['output'];
	symbol: Scalars['String']['output'];
	upperBand: Scalars['Float']['output'];
};

export type User = {
	__typename?: 'User';
	id: Scalars['ID']['output'];
	name: Scalars['String']['output'];
};

export type WatchedAsset = {
	__typename?: 'WatchedAsset';
	asset?: Maybe<Asset>;
	id: Scalars['String']['output'];
	price?: Maybe<AssetLivePriceData>;
	symbol: Scalars['String']['output'];
	userId?: Maybe<Scalars['ID']['output']>;
};
