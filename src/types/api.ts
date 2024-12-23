export interface BinanceDailyTickerResponse {
    symbol: string;
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
}

export interface NewsAPIResponse {
    link: string;
    title: string;
    image_url: string;
    pubDate: string;
}
