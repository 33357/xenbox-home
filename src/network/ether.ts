import { YENClient, ERC20Client, DeploymentInfo } from "yen-sdk";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Signer, providers } from "ethers";

export class Ether {
  public ethereum: any;

  public singer: Signer | undefined;

  public provider: providers.Web3Provider | undefined;

  public chainId: number | undefined;

  public yen: YENClient | undefined;

  public pair: ERC20Client | undefined;

  async load() {
    this.ethereum = (await detectEthereumProvider()) as any;
    if (this.ethereum) {
      this.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      this.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      await this.ethereum.request({ method: "eth_requestAccounts" });
      this.provider = new ethers.providers.Web3Provider(this.ethereum);
      this.singer = this.provider.getSigner();
      this.chainId = await this.singer.getChainId();
      if (DeploymentInfo[this.chainId]) {
        this.yen = new YENClient(
          this.singer,
          DeploymentInfo[this.chainId]["YEN"].proxyAddress
        );
      }
    } else {
      throw "Please use a browser that supports web3 to open";
    }
  }

  loadPair(address: string) {
    if (this.singer) {
      this.pair = new ERC20Client(this.singer, address);
    }
  }

  async addToken(address: string) {
    if (this.ethereum) {
      await this.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: address,
            symbol: "YEN",
            decimals: 18,
            image: "https://yen.cool/favicon.png",
          },
        },
      });
    }
  }
}
