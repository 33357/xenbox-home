import axios from "axios";

export class Request {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getRank(chainId: number, term: number) {
    return axios.get(`${this.url}/api/rank/${chainId}/${term}`);
  }
}
