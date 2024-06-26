import { ServerRespond } from './DataStreamer';

export interface Row {
  ratio: number,
  price_abc: number,
  price_def: number,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
  timestamp: Date,
}


export class DataManipulator {
  static generateRow(data: ServerRespond[]) {

    const abc = data[data.length - 2];
    const def = data[data.length - 1];

    const now = new Date();

    let f_total = 0;
    let f_num = 0;
    for (let i = 0; i < data.length; i += 2) {
        const f_abc = data[i];
        const f_def = data[i + 1];
        const f_timestamp = (f_abc.timestamp > f_def.timestamp) ? f_abc.timestamp : f_def.timestamp;
        if (f_timestamp <= new Date(now.getTime() - 31557600000)) continue;
        const f_price_abc = (f_abc.top_ask && f_abc.top_ask.price) || 0;
        const f_price_def = (f_def.top_ask && f_def.top_ask.price) || 0;
        const f_ratio = (f_price_abc === 0 || f_price_def === 0) ? 0 : f_price_abc / f_price_def;
        f_total += f_ratio;
        f_num++;
    }

    const f_ratio = f_total / f_num;

    const upper_bound = f_ratio * 1.1;
    const lower_bound = f_ratio * 0.9;

    const timestamp = (abc.timestamp > def.timestamp) ? abc.timestamp : def.timestamp;

    const price_abc = (abc.top_ask && abc.top_ask.price) || 0;
    const price_def = (def.top_ask && def.top_ask.price) || 0;

    const ratio = (price_abc === 0 || price_def === 0) ? 0 : price_abc / price_def;

    return {
        ratio: ratio,
        price_abc: price_abc,
        price_def: price_def,
        upper_bound: upper_bound,
        lower_bound: lower_bound,
        trigger_alert: (ratio > upper_bound || ratio < lower_bound) ? ratio : undefined,
        timestamp: timestamp,
    }
  }
}
