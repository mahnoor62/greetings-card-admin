// module.exports = {
//   reactStrictMode: true,
//   output: 'export'
// };
// next.config.js
module.exports = {
  reactStrictMode: true,
    output: 'export',
  async headers() {
    return [
      {
        source: '/font/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },
};
