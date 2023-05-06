import Identicon from "identicon.js";
import moment from "moment";
import { utils as ether, BigNumber } from "ethers";

export { BigNumber } from "ethers";

let lastTime: number;

export function log(...args: any) {
  if (!lastTime) {
    console.log(new Date().toLocaleString(), ...args);
  } else {
    console.log(
      new Date().toLocaleString(),
      new Date().getTime() - lastTime,
      ...args
    );
  }
  lastTime = new Date().getTime();
}

const num = {
  min: "0x0000000000000000000000000000000000000000",
  max: "0xffffffffffffffffffffffffffffffffffffffff",
  gwei: BigNumber.from(10 ** 9),
  ether: BigNumber.from(10 ** 9).mul(BigNumber.from(10 ** 9))
};

const have = {
  value(obj: any) {
    return obj && Object.keys(obj).length != 0;
  }
};

const convert = {
  hexStringToBase64(hexString: string) {
    return Buffer.from(hexString.substring(2), "hex").toString("base64");
  },
  Base64ToHexString(base64: string) {
    return "0x" + Buffer.from(base64, "base64").toString("hex");
  }
};

const func = {
  sleep: (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time));
  },

  retry: async (
    _func: Function,
    time: number,
    args?: Array<any>,
    callback?: Function
  ): Promise<any> => {
    try {
      let res;
      if (args) {
        res = await _func(...args);
      } else {
        res = await _func();
      }
      if (callback) {
        await callback(res);
      }
      return res;
    } catch (error) {
      time--;
      if (time > 0) {
        log(`retry ${time}, ${error}`);
        await func.sleep(1000);
        return await func.retry(_func, time, args, callback);
      } else {
        throw error;
      }
    }
  }
};

const deep = {
  clone(toObj: any, fromObj: any) {
    Object.keys(toObj).forEach(key => {
      if (fromObj[key]) {
        if (Object.prototype.toString.call(fromObj[key]) != "[object Object]") {
          toObj[key] = fromObj[key];
        } else {
          deep.clone(toObj[key], fromObj[key]);
        }
      }
    });
  },
  equal(obj1: any, obj2: any) {
    return obj1.toString() == obj2.toString();
  }
};

const get = {
  last(arr: Array<any>) {
    return arr[arr.length - 1];
  },
  avatar(address: string) {
    return "data:image/png;base64," + new Identicon(address, 120).toString();
  }
};

const is = {
  url(text: string) {
    const UrlReg = new RegExp(
      /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
    );
    return UrlReg.test(text);
  },
  mobile() {
    let flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    if (flag && flag.length) {
      return true;
    }
    return false;
  }
};

const format = {
  time(time: number) {
    // 大于昨天
    if (
      Number(
        moment()
          .add(-1, "days")
          .startOf("day")
      ) > time
    ) {
      return moment(time).format("M/D HH:mm");
    }
    // 昨天
    if (Number(moment().startOf("day")) > time) {
      return "昨天 " + moment(time).format("HH:mm");
    }
    // 大于五分钟不显示秒
    if (new Date().valueOf() > time + 300000) {
      return moment(time).format("HH:mm");
    }
    return moment(time).format("HH:mm:ss");
  },

  date(time: number | Date) {
    if (typeof time == "number") {
      return moment(time * 1000).format("Y/M/D HH:mm:ss");
    } else {
      return moment(time).format("Y/M/D HH:mm:ss");
    }
  },

  bigToString(big: BigNumber, decimals: number, fix: number) {
    let str = big.toString();
    if (str == "0") {
      return str;
    }
    const change = str.length - decimals;
    if (change > 0) {
      str = `${str.substring(0, change)}.${str.substring(
        change,
        change + fix
      )}`;
    } else {
      for (let i = 0; i > change; i--) {
        str = `0${str}`;
      }
      str = `0.${str}`.substring(0, fix + 2);
    }
    while (str[str.length - 1] == "0" || str[str.length - 1] == ".") {
      str = str.substring(0, str.length - 1);
    }
    return str;
  },

  stringToBig(str: string, decimals: number) {
    try {
      const strArr = str.split(".");
      const big1 = BigNumber.from((10 ** decimals).toString()).mul(strArr[0]);
      if (strArr.length > 1) {
        while (strArr[1].length < decimals) {
          strArr[1] = `${strArr[1]}0`;
        }
        const big2 = BigNumber.from(strArr[1]);
        return big1.add(big2);
      }
      return big1;
    } catch (error) {
      return BigNumber.from(0);
    }
  },

  string1(str: string, length: number) {
    if (str.length > length) {
      str = str.substring(0, length) + "...";
    }
    return str;
  },

  string2(str: string, halfLength: number) {
    if (str.length > halfLength * 2) {
      str =
        str.substring(0, halfLength) +
        "..." +
        str.substring(str.length - halfLength);
    }
    return str;
  }
};

const go = {
  address(chainId: number, address: string) {
    window.open(`${chain[chainId].scan}address/${address}`);
  },

  token(chainId: number, address: string) {
    window.open(`${chain[chainId].scan}token/${address}`);
  },

  tx(chainId: number, tx: string) {
    window.open(`${chain[chainId].scan}tx/${tx}`);
  },

  accounts(chainId: number) {
    window.open(`${chain[chainId].scan}/accounts`);
  }
};

const chain: { [CHAIN_ID: string]: Chain } = {
  1: {
    scan: "https://etherscan.io/",
    name: "ETH",
    node: "https://mainnet.infura.io/v3/"
  },
  5: {
    scan: "https://goerli.etherscan.io/",
    name: "Goerli",
    node: "https://goerli.infura.io/v3/"
  }
};

export interface Chain {
  scan: string;
  name: string;
  node: string;
}

export const utils = {
  num,
  func,
  deep,
  get,
  is,
  have,
  format,
  go,
  convert,
  ether,
  chain
};
