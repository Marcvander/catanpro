module.exports = {
  configureWebpack: {
    devtool: 'source-map',
  },
  devServer: {
    disableHostCheck: false, // set to true if you wanna accept any host name
    allowedHosts: ['localhost', '.safelet.tech'],
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/catanpro/'
    : '/'

  // chainWebpack: config => {
  // 	// GraphQL Loader
  // 	config.module
  // 		.rule('graphql')
  // 		.test(/\.(graphql|gql)$/)
  // 		.use('graphql-tag/loader')
  // 		.loader('graphql-tag/loader')
  // 		.end()
  // }
};
