import { requestGraphql } from "./request.js";

const loginQuery = `
  mutation login($input: ObtainJSONWebTokenInput!) {
    obtainKrakenToken(input: $input) {
      token
      refreshToken
    }
  }
`;

type LoginResponse = {
  obtainKrakenToken: {
    token: string;
    refreshToken: string;
  };
};

export const login = async (email: string, password: string) => {
  const result = await requestGraphql({
    query: loginQuery,
    variables: {
      input: {
        email,
        password,
      },
    },
  });
  const data = result.data as LoginResponse;
  return data.obtainKrakenToken.token;
};
