import axios from "axios";

export class Request {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getRank(day: number) {
    return axios.get(`${this.url}/api/rank/${day}`);
  }
}
