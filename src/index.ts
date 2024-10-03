import { TZDate } from "@date-fns/tz";
import { addSeconds, endOfMonth, format, startOfDay, startOfMonth } from "date-fns";

import { postDiscordMessage } from "./discord.js";
import { env } from "./env.js";
import { login } from "./login.js";
import { fetchHalfHourlyReadings } from "./reading.js";
import { _, sumByKey } from "./utils.js";

const today = startOfDay(TZDate.tz("Asia/Tokyo"));
const yesterday = addSeconds(today, -1);

// eslint-disable-next-line no-console
console.log({
  today: today.toISOString(),
  yesterday: yesterday.toISOString(),
});

const token = await login(env.OEJP_EMAIL, env.OEJP_PASSWORD);
const result = await fetchHalfHourlyReadings({
  accountNumber: env.OEJP_ACCOUNT_NUMBER,
  fromDatetime: startOfMonth(yesterday).toISOString(),
  toDatetime: yesterday.toISOString(),
  token,
});

// eslint-disable-next-line no-console
console.log(result);

const yesterdayKey = format(yesterday, "yyyy-MM-dd");
const sumCostEstimate = sumByKey(Object.values(result), "costEstimate");
const avgCostEstimate = sumCostEstimate / Object.keys(result).length;
const remainingDaysOfThisMonth = endOfMonth(yesterday).getDate() - yesterday.getDate();
const sumCostEstimateOfThisMonth = sumCostEstimate + avgCostEstimate * remainingDaysOfThisMonth;
const sumCostEstimateOf30Days = avgCostEstimate * 30;

await postDiscordMessage(`\
## 昨日(${yesterdayKey})の電力使用状況
${_(result[yesterdayKey].value)} kWh
${_(result[yesterdayKey].costEstimate)} 円
## 昨日までの合計料金
${_(sumCostEstimate)} 円
## 今月の推定料金
${_(sumCostEstimate)} + ${_(avgCostEstimate)} x ${remainingDaysOfThisMonth} = ${_(sumCostEstimateOfThisMonth)} 円
## 30日分の推定料金
${_(avgCostEstimate)} x 30 = ${_(sumCostEstimateOf30Days)} 円`);
