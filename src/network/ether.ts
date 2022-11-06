import { YENClient, DeploymentInfo } from "yen-sdk";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Signer } from "ethers";

export class Ether {
  public singer: Signer | undefined;

  public chainId: number | undefined;

  public yen: YENClient | undefined;

  constructor() {}

  async load() {
    const ethereum = (await detectEthereumProvider()) as any;
    if (ethereum) {
      ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(ethereum);
      this.singer = provider.getSigner();
      this.chainId = await this.singer.getChainId();
      if (DeploymentInfo[this.chainId]) {
        this.yen = new YENClient(
          this.singer,
          DeploymentInfo[this.chainId]["TESTYEN"].proxyAddress
        );
      }
    } else {
      throw "Please use a browser that supports web3 to open";
    }
  }
}
