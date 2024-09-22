export const sumByKey = <T>(items: T[], key: keyof T) => {
  return items.reduce((acc, item) => acc + Number(item[key]), 0);
};

export const _ = (value: number) => {
  return value.toLocaleString("ja-JP", { maximumFractionDigits: 2 });
};
