module.exports = ({ config }) => {
  const baseUrl = process.env.NIGHTFALL_WEB_BASE_URL?.replace(/\/+$/, '');
  if (!baseUrl) return config;

  if (!baseUrl.startsWith('/') || baseUrl.includes('..')) {
    throw new Error('NIGHTFALL_WEB_BASE_URL must be a safe absolute path prefix.');
  }

  return {
    ...config,
    experiments: {
      ...config.experiments,
      baseUrl,
    },
  };
};
