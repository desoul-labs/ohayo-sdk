module.exports = {
  extends: ['@react-native-community', 'prettier'],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'comma-dangle': 0,
  },
  parserOptions: {
    requireConfigFile: false,
  },
};
