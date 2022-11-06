export interface Chain {
  SCAN_URL: string;
  CHAIN_NAME: string;
  NODE_URL: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAIN: { [CHAIN_ID: string]: Chain } = {
  56: {
    SCAN_URL: "https://bscscan.com/",
    CHAIN_NAME: "bsc",
    NODE_URL: "https://bsc-dataseed1.binance.org",
  },
  97: {
    SCAN_URL: "https://testnet.bscscan.com/",
    CHAIN_NAME: "bscTest",
    NODE_URL: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
};

const SERVICE_URL: { [SERVICE: string]: string } = {
  DEBANK_HOME: "https://debank.com/",
  DEBANK_API: "https://api.debank.com",
};

const BACKGROUND_LIST = [
  {
    URL: "./static/background/pancake.jpg",
    TXET: "PANCAKE",
  },
  {
    URL: "./static/background/binance.jpg",
    TXET: "BINANCE",
  },
  {
    URL: "./static/background/venus.png",
    TXET: "VENUS",
  },
  {
    URL: "./static/background/autofarm.jpeg",
    TXET: "AUTOFARM",
  },
  {
    URL: "./static/background/btc.jpg",
    TXET: "BTC",
  },
  {
    URL: "./static/background/eth.jpg",
    TXET: "ETH",
  },
];

export const config = {
  CHAIN,
  SERVICE_URL,
  BACKGROUND_LIST,
  ZERO_ADDRESS,
};
