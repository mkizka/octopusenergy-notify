import { TZDate } from "@date-fns/tz";
import { addDays, endOfMonth, format } from "date-fns";

import { postDiscordMessage } from "./discord.js";
import { env } from "./env.js";
import { login } from "./login.js";
import { fetchHalfHourlyReadings } from "./reading.js";
import { _, sumByKey } from "./utils.js";

const now = TZDate.tz("Asia/Tokyo");
const yesterday = format(addDays(now, -1), "yyyy-MM-dd");
const twoDaysAgo = format(addDays(now, -2), "yyyy-MM-dd");
const firstDayOfThisMonth = new TZDate(now.getFullYear(), now.getMonth(), 1, "Asia/Tokyo");
const remainingDaysOfThisMonth = endOfMonth(now).getDate() - now.getDate() + 1;

const token = await login(env.OEJP_EMAIL, env.OEJP_PASSWORD);
const result = await fetchHalfHourlyReadings({
  accountNumber: env.OEJP_ACCOUNT_NUMBER,
  fromDatetime: firstDayOfThisMonth.toISOString(),
  toDatetime: now.toISOString(),
  token,
});

const diffValue = result[yesterday].value - result[twoDaysAgo].value;
const diffCostEstimate = result[yesterday].costEstimate - result[twoDaysAgo].costEstimate;
const sumCostEstimate = sumByKey(Object.values(result), "costEstimate");
const avgCostEstimate = sumCostEstimate / Object.keys(result).length;
const sumCostEstimateOfThisMonth = sumCostEstimate + avgCostEstimate * remainingDaysOfThisMonth;
const sumCostEstimateOf30Days = avgCostEstimate * 30;

await postDiscordMessage(`\
## 昨日(${yesterday})の電力使用状況
${_(result[yesterday].value)} kWh (前日より${_(diffValue)})
${_(result[yesterday].costEstimate)} 円 (前日より${_(diffCostEstimate)})
## 昨日までの合計料金
${_(sumCostEstimate)} 円
## 今月の推定料金
${_(sumCostEstimate)} + ${_(avgCostEstimate)} x ${remainingDaysOfThisMonth} = ${_(sumCostEstimateOfThisMonth)} 円
## 30日分の推定料金
${_(avgCostEstimate)} x 30 = ${_(sumCostEstimateOf30Days)} 円`);
