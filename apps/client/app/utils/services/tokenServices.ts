const ACCESS_TOKEN_NAME = "access-token-chms";

export const setAuthAccessToken = (token: string) => {
  document.cookie = `${ACCESS_TOKEN_NAME}=${token}; path=/; max-age=3600; SameSite=Strict`;
};
