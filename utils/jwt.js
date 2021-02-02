module.exports.getTokenFromRequesst = (req) => {
  if (!req || !req.headers || !req.headers.authorization) {
    return null;
  }
  const { authorization } = req.headers;
  if (
    typeof authorization !== 'string'
    || !authorization.startsWith('Bearer')
  ) {
    return null;
  }

  const token = authorization.split(' ')[1];
  return token;
};

module.exports.accessTokenKey = 'top_secret';
module.exports.refreshTokenKey = 'top_secret_refresh';
