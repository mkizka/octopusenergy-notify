const required = (value: string | undefined) => {
  if (!value) {
    throw new Error("Required");
  }
  return value;
};

export const env = {
  OEJP_ACCOUNT_NUMBER: required(process.env.OEJP_ACCOUNT_NUMBER),
  OEJP_EMAIL: required(process.env.OEJP_EMAIL),
  OEJP_PASSWORD: required(process.env.OEJP_PASSWORD),
  DISCORD_WEBHOOK_URL: required(process.env.DISCORD_WEBHOOK_URL),
};
