import { TZDate } from "@date-fns/tz";
import { addDays, endOfMonth, format } from "date-fns";
import dedent from "dedent";

import { postDiscordMessage } from "./discord.js";
import { env } from "./env.js";
import { login } from "./login.js";
import { fetchHalfHourlyReadings } from "./reading.js";

const now = TZDate.tz("Asia/Tokyo");

const yesterday = format(addDays(now, -1), "yyyy-MM-dd");
const twoDaysAgo = format(addDays(now, -2), "yyyy-MM-dd");

const getStartOfThisMonth = () => {
  return new TZDate(now.getFullYear(), now.getMonth(), 1, "Asia/Tokyo");
};

const getRemainingDaysOfThisMonth = () => {
  // 今日を含めた数を返す
  return endOfMonth(now).getDate() - now.getDate() + 1;
};

const sumByKey = <T>(items: T[], key: keyof T) => {
  return items.reduce((acc, item) => acc + Number(item[key]), 0);
};

const _ = (value: number) => {
  return value.toLocaleString("ja-JP", { maximumFractionDigits: 2 });
};

const main = async () => {
  const token = await login(env.OEJP_EMAIL, env.OEJP_PASSWORD);
  const result = await fetchHalfHourlyReadings({
    accountNumber: env.OEJP_ACCOUNT_NUMBER,
    fromDatetime: getStartOfThisMonth().toISOString(),
    toDatetime: TZDate.tz("Asia/Tokyo").toISOString(),
    token,
  });

  const diffValue = result[yesterday].value - result[twoDaysAgo].value;
  const diffCostEstimate = result[yesterday].costEstimate - result[twoDaysAgo].costEstimate;
  const sumCostEstimate = sumByKey(Object.values(result), "costEstimate");
  const avgCostEstimate = sumCostEstimate / Object.keys(result).length;
  const remainingDays = getRemainingDaysOfThisMonth();
  const sumCostEstimateOfThisMonth = sumCostEstimate + avgCostEstimate * remainingDays;
  const sumCostEstimateOf30Days = avgCostEstimate * 30;

  await postDiscordMessage(dedent`
    ## 昨日(${yesterday})の電力使用状況
    ${_(result[yesterday].value)} kWh (前日より${_(diffValue)})
    ${_(result[yesterday].costEstimate)} 円 (前日より${_(diffCostEstimate)})
    ## 昨日までの合計料金
    ${_(sumCostEstimate)} 円
    ## 今月の推定料金
    ${_(sumCostEstimate)} + ${_(avgCostEstimate)} x ${remainingDays} = ${_(sumCostEstimateOfThisMonth)} 円
    ## 平均料金から推測した30日分の料金
    ${_(avgCostEstimate)} x 30 = ${_(sumCostEstimateOf30Days)} 円
  `);
};

// eslint-disable-next-line
main().catch(console.error);
