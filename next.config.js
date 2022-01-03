const path = require('path');

module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    config.resolve.alias['@abi'] = path.resolve('sol/abi/sol/contracts');

    return config
  }
}