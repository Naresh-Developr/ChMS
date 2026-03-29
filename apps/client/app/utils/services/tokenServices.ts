const ACCESS_TOKEN_NAME = "access-token-chms";

export const setAuthAccessToken = (token: string, expiresOn: string) => {
  const maxAge = Math.floor(new Date(expiresOn).getTime() - Date.now() / 1000);
  document.cookie = `${ACCESS_TOKEN_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
};
