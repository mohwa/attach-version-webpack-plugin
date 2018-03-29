
# attach-version-webpack-plugin

`attach-version-webpack-plugin` is webpack plugin for inject asset version in template files.


## Install

```
npm i --D attach-version-webpack-plugin
```

## Usage

webpack.config.js

```
const AttachVersionWebpackPlugin = require('attach-version-webpack-plugin');

module.exports = {
  entry: 'index.js',
  output: {
    path: 'path/to/build',
    filename: 'index.js'
  },
  plugins: [
    new AttachVersionWebpackPlugin({
        templates: [
            'path/to/index.html'
            ...
        ]
    }),
  ]
}
```

## index.html

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    ...

    <link rel="stylesheet" href="assets/bxuip-angular.js-ui/dist/assets/css/bx-ui.min.css?v=15c70318">
    <link rel="stylesheet" href="assets/bxuip-angular.js-ui/dist/assets/theme/bx-theme-blackdiamond.css?v=32c62e2b">

    <script type="text/javascript" src="assets/jquery/dist/jquery.min.js?v=69bb69e2"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/react-router/4.2.0/react-router.min.js?test=dkajdkjadlkjakl&amp;v=59eb182b&amp;v=59eb182b&amp;v=59eb182b&amp;v=59eb182b"></script>
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/reactstrap/5.0.0/reactstrap.full.min.js?v=f24f9127&amp;v=f24f9127&amp;v=f24f9127&amp;v=f24f9127"></script>
    <script type="text/javascript" src="file://cdnjs.cloudflare.com/ajax/libs/reactstrap/5.0.0/reactstrap.full.min.js"></script>

    <script src="/xjs/_/js/k=xjs.s.ko.rXdMp5Gu4b8.O/m=RMhBfe/am=wCJ0xz8A-f_BgCLRCkZYgGjBMDQ/exm=sx,sb,cdos,cr,elog,hsm,jsa,r,d,csi,aa,abd,async,dvl,foot,fpe,ipv6,lu,m,mpck,mu,sf,sonic,spch,tl,vs,d3l,tnv,mrn,exdp,udlg,me,atn,WgDvvc/rt=j/d=1/ed=1/t=zcms/rs=ACT90oFgvw8nFkcuTWJsiBY1uz8e0LS2Zw" async gapi_processed="true"></script>

    <script src="/xjs/_/js/k=xjs.s.ko.rXdMp5Gu4b8.O/m=aa,abd,async,dvl,foot,fpe,ipv6,lu,m,mpck,mu,sf,sonic,spch,tl,vs,d3l,tnv,mrn,exdp,udlg,me,atn,WgDvvc/am=wCJ0xz8A-f_BgCLRCkZYgGjBMDQ/exm=sx,sb,cdos,cr,elog,hsm,jsa,r,d,csi/rt=j/d=1/ed=1/t=zcms/rs=ACT90oFgvw8nFkcuTWJsiBY1uz8e0LS2Zw?xjs=s1" async></script>

    <script nonce="VzMSAYyd7jNi/cVrj/xGcA==">window.gbar&&gbar.up&&gbar.up.tp&&gbar.up.tp();</script>

</head>
<body ng-app="app">
    <ui-view></ui-view>

	<script type="text/javascript" src="common_bundle.js?v=747ec249"></script>
	<script type="text/javascript" src="app/app.config.js?v=bf480dcb"></script>
	<script type="text/javascript" src="app/app.js?v=d1727213"></script>

</body></html>
```

Default command:

```
mynpm-pub --config /path/to/config.yaml
```

### CLI Arguments

```
usage: mynpm-pub [-h] [-v] [-c CONFIG] [--packages PACKAGES [PACKAGES ...]]
                 [-f FORCE]


my-npm-pub cli example

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -c CONFIG, --config CONFIG
                        verdaccio configuration file path
  --packages PACKAGES [PACKAGES ...]
                        installation each packages.
  -f FORCE, --force FORCE
                        Force the installation of the package.
```

## ClI Example

```
# default
mynpm-pub --config /path/to/config.yaml

# publish to each packages
mynpm-pub --config /path/to/config.yaml --packages test test1

# publish to force
mynpm-pub --config /path/to/config.yaml --force true
```




