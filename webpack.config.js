var webpack = require('webpack');
const path = require('path');
const argv = require('yargs').argv;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const isDevelopment = argv.mode === 'development';
const isProduction = !isDevelopment;

const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: isDevelopment
});

const config = {
  entry: {
    admin: './src/admin/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'fhq.admin.js'
  },
  devServer: {
    contentBase: 'dist/',
    port: 9000,
    compress: true,
    open: true
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }]
    }, 
    {
		test: /\.scss$/,
		use: [{
		  loader: 'style-loader', // inject CSS to page
		}, {
		  loader: 'css-loader', // translates CSS into CommonJS modules
		}, {
		  loader: 'postcss-loader', // Run post css actions
		  options: {
			plugins: function () { // post css plugins, can be exported to postcss.config.js
			  return [
				require('precss'),
				require('autoprefixer')
			  ];
			}
		  }
		}, {
		  loader: 'sass-loader' // compiles Sass to CSS
		}]
	},
	{
		test: /\.css$/,
		use: [{
		  loader: 'style-loader', // inject CSS to page
		}, {
		  loader: 'css-loader', // translates CSS into CommonJS modules
		}, {
		  loader: 'postcss-loader', // Run post css actions
		  options: {
			plugins: function () { // post css plugins, can be exported to postcss.config.js
			  return [
				require('precss'),
				require('autoprefixer')
			  ];
			}
		  }
		}, {
		  loader: 'sass-loader' // compiles Sass to CSS
		}]
	},{
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: [{
			loader: 'file-loader',
			options: {
			  // name: 'images/[name][hash].[ext]'
			  name: 'images/[name].[ext]'
			}
		  }, {
			loader: 'image-webpack-loader',
			options: {
			  mozjpeg: {
				progressive: true,
				quality: 70
			  }
			}
		  },
      ],
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: 'fonts/[name][hash].[ext]'
        }
      },
    }]
  },
  plugins: [
    extractSass,
    new HtmlWebpackPlugin({
      template: './src/admin/index.html', filename: "index.html"
    }),
    new CopyWebpackPlugin([
            {from:'src/admin/favicon.ico',to:'favicon.ico'} 
	]), 
	new ExtractTextPlugin("src/admin/css/fhq.admin.css"),
	new webpack.ProvidePlugin({
	  $: 'jquery',
	  jQuery: 'jquery',
	  'window.jQuery': 'jquery',
	  tether: 'tether',
	  Tether: 'tether',
	  'window.Tether': 'tether',
	  Popper: ['popper.js', 'default'],
	  'window.Tether': 'tether',
	  Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
	  Button: 'exports-loader?Button!bootstrap/js/dist/button',
	  Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
	  Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
	  Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
	  Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
	  Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
	  Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
	  Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
	  Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
	  Util: 'exports-loader?Util!bootstrap/js/dist/util'
	})
  ],
  optimization: isProduction ? {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false,
            warnings: false,
            drop_console: true,
            unsafe: true
          },
        },
      }),
    ],
  } : {}
};

module.exports = config;
