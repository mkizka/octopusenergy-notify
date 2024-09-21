import { env } from "./env.js";

export const postDiscordMessage = async (message: string) => {
  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
  return response;
};
