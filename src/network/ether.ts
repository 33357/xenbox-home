import { XenBoxClient, DeploymentInfo } from "xenbox-sdk";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Signer, providers } from "ethers";

export class Ether {
  public ethereum: any;

  public singer: Signer | undefined;

  public provider: providers.Web3Provider | undefined;

  public chainId: number | undefined;

  public xenBox: XenBoxClient | undefined;

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
        this.xenBox = new XenBoxClient(
          this.singer,
          DeploymentInfo[this.chainId]["XenBox"].proxyAddress
        );
      } else {
        await this.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x1",
            },
          ],
        });
      }
    } else {
      throw "Please use a browser that supports web3 to open";
    }
  }
}
