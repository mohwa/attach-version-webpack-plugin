
# attach-version-webpack-plugin

`attach-version-webpack-plugin` is webpack plugin for inject asset version in template files.


## Install

```
npm i --D attach-version-webpack-plugin
```

## Basic usage

webpack.config.js

```
const AttachVersionWebpackPlugin = require('attach-version-webpack-plugin');

module.exports = {
  entry: 'index.js',
  output: {
    path: 'path/to/dist',
    filename: 'index.bundle.js'
  },
  plugins: [
    new AttachVersionWebpackPlugin({
        context: 'path/to' // The base directory, an absolute path, for resolving entry points.
        templates: [
            'index.html' // The template directory, an relative path via context path.
            ...
        ]
    }),
  ]
}
```

## The contents of generated index.html file.

> Template files move through declared webpack output path.

> if online, injected remote asset version.

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    ...
    <!-- css asset -->
    <link rel="stylesheet" href="path/to/test.css?v=07798350">
    ...
    <!-- remote javascript asset -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/react-router/4.2.0/react-router.min.js?v=59eb182b"></script>
</head>
<body>
    <!-- internal javascript asset -->
	<script type="text/javascript" src="common_bundle.js?v=747ec249"></script>
	...
</body>
</html>
```

## Options

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|`context`|`{String}`|`''`|The base directory, an absolute path, for resolving entry points.<br/><br/>```context: '/src'```<br>```templates: ['index.html'] // src/index.html```|
|`templates`|`{Array}`|`'[]'`|The template directory, an relative path via context path.|


## Context example

```
context: '/src'
templates: 'index.html' // src/index.html
```



