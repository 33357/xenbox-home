import { XenClient, XenBoxClient, DeploymentInfo } from "xenbox-sdk";
import {
  XenBoxUpgradeableClient,
  XenBoxHelperClient,
  DeploymentInfo as DeploymentInfo2
} from "xenbox2-contract-sdk";
import { utils } from "../const";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Signer, providers, BigNumber } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

export class Ether {
  public ethereum: any;

  public singer: Signer | undefined;

  public provider: providers.Web3Provider | undefined;

  public chainId: number | undefined;

  public xen: XenClient | undefined;

  public xenBox: XenBoxClient | undefined;

  public xenBoxUpgradeable: XenBoxUpgradeableClient | undefined;

  public xenBoxHelper: XenBoxHelperClient | undefined;

  async load(chainId: number) {
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
      if (this.chainId != chainId) {
        await this.changeChain(chainId);
      }
      if (DeploymentInfo2[this.chainId]) {
        if (this.chainId == 1) {
          this.xenBox = new XenBoxClient(
            this.singer,
            DeploymentInfo[this.chainId]["XenBox"].proxyAddress
          );
        }
        this.xenBoxUpgradeable = new XenBoxUpgradeableClient(
          this.singer,
          DeploymentInfo2[this.chainId]["XenBoxUpgradeable"].proxyAddress
        );
        this.xenBoxHelper = new XenBoxHelperClient(
          this.singer,
          DeploymentInfo2[this.chainId]["XenBoxHelper"].proxyAddress
        );
        this.xen = new XenClient(this.singer);
      } else {
        await this.changeChain(1);
      }
    } else {
      throw "Please use a browser that supports web3 to open";
    }
  }

  async changeChain(chainId: number) {
    if (chainId == 1 || chainId == 56 || chainId == 137) {
      await this.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${chainId.toString(16)}`
          }
        ]
      });
    }
  }

  async getEthPrice(chainId: number) {
    if (chainId == 1) {
      const quoterContract = new ethers.Contract(
        "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        Quoter.abi,
        this.provider
      );
      return await quoterContract.callStatic.quoteExactOutputSingle(
        "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        10000,
        utils.num.ether,
        0
      );
    } else if (chainId == 56) {
      const quoterContract = new ethers.Contract(
        "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        Quoter.abi,
        this.provider
      );
      return await quoterContract.callStatic.quoteExactOutputSingle(
        "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        10000,
        utils.num.ether,
        0
      );
    } else if (chainId == 137) {
      const quoterContract = new ethers.Contract(
        "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        Quoter.abi,
        this.provider
      );
      return await quoterContract.callStatic.quoteExactOutputSingle(
        "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        10000,
        utils.num.ether,
        0
      );
    }
  }
}
