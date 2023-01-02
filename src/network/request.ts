import axios from "axios";

export class Request {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getRank30() {
    return axios.get(`${this.url}/api/rank/30`);
  }
}
