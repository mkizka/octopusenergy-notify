import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

import { requestGraphql } from "./request.js";

const halfHourlyReadingsQuery = `
query halfHourlyReadings($accountNumber: String!, $fromDatetime: DateTime, $toDatetime: DateTime) {
  account(accountNumber: $accountNumber) {
    properties {
      electricitySupplyPoints {
        halfHourlyReadings(fromDatetime: $fromDatetime, toDatetime: $toDatetime) {
          startAt
          value
          costEstimate
        }
      }
    }
  }
}
`;

type HalfHourlyReading = {
  startAt: string;
  value: string;
  costEstimate: string;
};

type HalhHourlyReadingsResponse = {
  account: {
    properties: {
      electricitySupplyPoints: {
        halfHourlyReadings: HalfHourlyReading[];
      }[];
    }[];
  };
};

const aggrageteByDate = (readings: HalfHourlyReading[]) => {
  const result: Record<string, { value: number; costEstimate: number }> = {};
  for (const reading of readings) {
    const date = format(new TZDate(reading.startAt, "Asia/Tokyo"), "yyyy-MM-dd");
    if (date in result) {
      result[date].value += Number(reading.value);
      result[date].costEstimate += Number(reading.costEstimate);
    } else {
      result[date] = {
        value: Number(reading.value),
        costEstimate: Number(reading.costEstimate),
      };
    }
  }
  return result;
};

export const fetchHalfHourlyReadings = async ({
  accountNumber,
  fromDatetime,
  toDatetime,
  token,
}: {
  accountNumber: string;
  fromDatetime: string;
  toDatetime: string;
  token: string;
}) => {
  const result = await requestGraphql({
    query: halfHourlyReadingsQuery,
    variables: {
      accountNumber,
      fromDatetime,
      toDatetime,
    },
    headers: {
      Authorization: token,
    },
  });
  const data = result.data as HalhHourlyReadingsResponse;
  const { halfHourlyReadings } = data.account.properties[0].electricitySupplyPoints[0];
  return aggrageteByDate(halfHourlyReadings);
};
