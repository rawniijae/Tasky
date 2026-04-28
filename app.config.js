export default ({ config }) => {
  // Use APP_VARIANT for EAS builds, fallback to NODE_ENV for local development
  const IS_DEV = process.env.APP_VARIANT === 'development' || process.env.NODE_ENV === 'development';

  return {
    ...config,
    name: IS_DEV ? `${config.name} (Dev)` : config.name,
    android: {
      ...config.android,
      package: IS_DEV ? `${config.android?.package}.debug` : config.android?.package,
      versionCode: config.android?.versionCode || 1,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: IS_DEV 
        ? `${config.ios?.bundleIdentifier || config.android?.package}.debug` 
        : config.ios?.bundleIdentifier || config.android?.package,
    },
    extra: {
      ...config.extra,
      isDev: IS_DEV,
    },
  };
};
