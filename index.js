
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');
const _ = require('lodash');
const request = require('request');
const onlineChecker = require('is-online');
const queryString = require('query-string');
const fse = require('fs-extra');
const log = require('./lib/log');

const tmpAssetPath = path.join(__dirname, '__assets');

// 온라인 여부
let isOnline = false;

/**
 * 전달받은 template file 내부 <script> 또는 <link> 엘리먼트의 src/href 속성값에 "hash version" 을 추가시킨다.
 */
class AttachVersionWebpackPlugin{

    constructor({
        context = '',
        templates = []
    } = {}){
        // context path
        this.context = context;
        // template path
        this.templates = templates;
    }
    apply(compiler){

        let self = this;

        if (_.isEmpty(this.context)) log.fatal('Not found context property.');

        compiler.plugin('compile', function(){
            onlineChecker().then(online => { isOnline = true; });
        });

        // asset 이 output path 에 배포된 이후..
        compiler.plugin('after-emit', function(compilation, callback){

            // webpack output path
            const outputPath = this.outputPath;
            const indexHTMLPath = path.join(outputPath, 'index.html');

            const templates = _.isEmpty(self.templates) ? [indexHTMLPath] : self.templates;

            _.forEach(templates, v => {
                _attachVersion.call(this, self.context, path.join(self.context, v), callback);
            });
        });
    };
}

/**
 * asset 버전을 추가한다.
 *
 * @param templatePath
 * @param callback
 * @private
 */
function _attachVersion(context = '', templatePath = '', callback = function(){}){

    // 빌드 폴더에 index.html 파일이 없을 경우
    if (!fs.existsSync(templatePath)){

        console.log('Not found template file');
        callback();

        return;
    }

    const outputPath = this.outputPath;

    // 반드시 빌드 폴더에 index.html 파일이 존재해야한다.
    const template = fs.readFileSync(templatePath, 'utf-8');

    // dom element
    const $ = cheerio.load(template);

    const scripts = $('script');
    const links = $('link');

    const assets = [scripts, links];

    // element total length
    const assetLength = _.size(scripts) + _.size(links);

    let assetIndex = 0;

    // 출력될 파일 경로
    const outputFilePath = templatePath.replace(context, outputPath);

    _.forEach(assets, asset => {

        _.map(asset, elem => {

            const $elem = $(elem);
            const isScriptElem = _isScriptElem($elem);

            const entry = isScriptElem ? $elem.attr('src') : $elem.attr('href');

            // 온라인이면서, entry 값이 리모트인 경우...
            if (isOnline && _isRemoteEntry(entry)){

                const parseUrl = queryString.parseUrl(entry);

                const baseSrc = parseUrl.url;
                const baseFileName = path.parse(baseSrc).base;

                const tmpAssetFilePath = path.join(tmpAssetPath, baseFileName);

                if (!fs.existsSync(tmpAssetPath)) fse.ensureDirSync(tmpAssetPath);

                (($elem, tmpAssetFilePath) => {

                    // 리모트 파일들을 로컬에 다운받은 후, 그 파일 내용을 통해, hash 문자열을 생성해낸다.
                    request.get(entry).pipe(fs.createWriteStream(tmpAssetFilePath).on('finish', () => {

                        const hash = _getFileHash(tmpAssetFilePath);

                        _setSrc($elem, entry, hash);

                        ++assetIndex;
                    }));

                })($elem, tmpAssetFilePath);
            }
            else{

                if (!_.isEmpty(entry)){

                    const hash = _getFileHash(outputFilePath);

                    _setSrc($elem, entry, hash);
                }

                ++assetIndex;
            }
        });
    });

    const intervalId = setInterval(() => {

        if (assetLength === assetIndex){

            fs.writeFileSync(outputFilePath, $.html());

            // 리모트 파일 폴더를 삭제한다.
            fse.removeSync(tmpAssetPath);

            clearInterval(intervalId);

            callback();
        }
    }, 100);
}
/**
 * 엘리먼트 src 값을 할당한다.
 *
 * @param $elem
 * @param src
 * @param query
 * @param hash
 * @private
 */
function _setSrc($elem = null, src = '', hash = ''){

    if (!_.isEmpty(hash)) src = /\?+/.test(src) ? `${src}&v=${hash}` : `${src}?v=${hash}`;

    if (_isScriptElem($elem)) $elem.attr('src', src);
    else $elem.attr('href', src);
}

/**
 * Script 엘리먼트 여부를 반환한다.
 * @param $elem
 * @returns {boolean}
 * @private
 */
function _isScriptElem($elem = null){
    return $elem.get(0).tagName === 'script' ? true : false;
}


/**
 * 리모트 파일 여부를 반환한다.
 *
 * @param v
 * @returns {boolean}
 * @private
 */
function _isRemoteEntry(v = ''){

    const ptn = /^(http|https):\/\//;

    return ptn.test(v);
}

/**
 * 파일 hash 값을 반환한다.
 * @param filePath
 * @returns {string}
 * @private
 */
function _getFileHash(filePath = ''){

    let ret = '';

    if (fs.existsSync(filePath)){

        const source = fs.readFileSync(filePath, 'utf-8');
        const hash = crypto.createHash('sha1').update(source, 'md5').digest('hex');

        ret = hash.substr(0, 8);
    }

    return ret;
}


module.exports = AttachVersionWebpackPlugin;