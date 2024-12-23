import type { Asset, AssetHistoricalPriceData, AssetNews, PriceAnalysis } from "./graphql.js";

export interface AssetDetailResponse {
    asset: Asset;
    analysis: PriceAnalysis;
    news: AssetNews;
    historical: AssetHistoricalPriceData[];
}
