import { YENClient, DeploymentInfo } from "yen-sdk";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Signer } from "ethers";
import { utils, log, config } from "../const";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";

export class Ether {
  private _ethereum: any;

  private _defaultChainId = 1;

  public singer: Signer | undefined;

  public chainId: number | undefined;

  public provider: Web3Provider | JsonRpcProvider | undefined;

  public yen: YENClient | undefined;

  constructor() {}

  async load(chainId: number) {
    this._ethereum = await detectEthereumProvider();
    if (this._ethereum) {
      this._ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      this._ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      await this._ethereum.request({ method: "eth_requestAccounts" });
      this.provider = new ethers.providers.Web3Provider(this._ethereum);
      this.singer = this.provider.getSigner();
      this.chainId = await this.singer.getChainId();
      // if (chainId != this.chainId && COMMON.CHAIN[chainId]) {
      //   this.changeChain(chainId)
      // }
      // if (!COMMON.CHAIN[this.chainId]) {
      //   this.changeChain(this._defaultChainId)
      // }
      this.yen = new YENClient(
        this.singer,
        DeploymentInfo[this.chainId]["TESTYEN"].proxyAddress
      );
    } else {
      log("Please use a browser that supports web3 to open");
      // this.provider = new ethers.providers.JsonRpcProvider(COMMON.CHAIN[chainId?chainId:this._defaultChainId].CHAIN_NODE_URL);
      // this.chainId = (await this.provider.getNetwork()).chainId;
      // await this.setContracts();
    }
  }

  // async changeChain(chainId: number) {
  //   this._ethereum.request({
  //     method: 'wallet_addEthereumChain',
  //     params: [
  //       {
  //         chainId: `0x${chainId.toString(16)}`,
  //         chainName: config.CHAIN[chainId].CHAIN_NAME,
  //         rpcUrls: [
  //           config.CHAIN[chainId].CHAIN_NODE_URL,
  //         ],
  //         blockExplorerUrls: [
  //           config.CHAIN[chainId].BLOCK_SCAN_URL,
  //         ],
  //         nativeCurrency: {
  //           name: config.CHAIN[chainId].TOKEN_NAME,
  //           symbol: config.CHAIN[chainId].TOKEN_SYMBOL,
  //           decimals: config.CHAIN[chainId].TOKEN_DECIMALS,
  //         },
  //       },
  //     ],
  //   });
  // }
}
