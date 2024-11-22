const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('pte')
config.resolver.assetExts.push('bin')
module.exports = config;
