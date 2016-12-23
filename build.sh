#!/usr/bin/env sh
node -e "var fs=require('fs'); var index = '' + fs.readFileSync('./index.html'); var wrapup=require('wrapup'); var w = new wrapup(); w.require(require.resolve('./js/stage.wrup')); w.up(function(e, res) { console.log(index.replace('<script src=\"js/stage.wrup\"></script>', '').replace('<script src=\"js/libs/pixi.js\"></script>','')); fs.writeFileSync('wrup.js', res) }); " > index.temp.html
./node_modules/.bin/polybuild index.temp.html
rm index.temp.html
echo "<script src=\"js/libs/pixi.js\"></script>" >> index.temp.build.html
echo "<script>" >> index.temp.build.html
cat wrup.js >> index.temp.build.html
echo "</script>" >> index.temp.build.html
rm wrup.js
node -e "var fs=require('fs'); var index = '' + fs.readFileSync('./index.temp.build.html');  console.log(index.replace(/(<!--([\S\s]*?)-->)*<meta/gm, '<!--'+fs.readFileSync('SINGLELICENSE')+'--><meta').replace('index.temp.build.js', 'index.build.js')); " > index.build.html
rm index.temp.build.html
mv index.temp.build.js index.build.js
