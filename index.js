
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');
const _ = require('lodash');
const request = require('request');
const onlineChecker = require('is-online');
const queryString = require('query-string');
const fse = require('fs-extra');

const tmpAssetPath = path.join(__dirname, '_assets');

// 온라인 여부
let isOnline = false;

let self = null;
/**
 * build/index.html 내부 script 또는 css 엘리먼트의 "src/href" 값에 "hash version" 을 주입시킨다.
 */
class InjectAssetsVersionPlugin{

    constructor({
        template = ''
    } = {}){

        self = this;

        this.template = template;
    }
    apply(compiler){

        compiler.plugin('compile', function(){
            onlineChecker().then(online => { isOnline = true; });
        });

        // asset 이 output path 에 배포된 이후..
        compiler.plugin('after-emit', function(compilation, callback){

            // webpack outputPath
            const outputPath = this.outputPath;
            const defaultTemplatePath = path.join(outputPath, 'index.html');

            const templatePath = _.isEmpty(self.template) ? defaultTemplatePath : self.template;

            // 빌드 폴더에 index.html 파일이 없을 경우
            if (!fs.existsSync(templatePath)){
                console.log('Not found template file');
                callback();

                return;
            }

            // 반드시 빌드 폴더에 index.html 파일이 존재해야한다.
            const template = fs.readFileSync(templatePath, 'utf-8');

            const $ = cheerio.load(template);

            const scripts = $('script');
            const links = $('link');

            const assets = [scripts, links];

            let filePath = '';
            let assetLength = _.size(scripts) + _.size(links);
            let assetIndex = 0;

            _.forEach(assets, (v) => {

                _.map(v, vv => {

                    const $elem = $(vv);
                    const isScript = _isScript($elem);

                    let src = isScript ? $elem.attr('src') : $elem.attr('href');

                    const parseUrl = queryString.parseUrl(src);

                    const baseSrc = parseUrl.url;
                    const query = parseUrl.query;

                    if (isOnline && _isRemoteFile(src)){

                        const base = path.parse(baseSrc).base;
                        filePath = path.join(tmpAssetPath, base);

                        if (!fs.existsSync(tmpAssetPath)) mkdir('-p', tmpAssetPath);

                        (($elem, filePath) => {

                            request.get(src).pipe(fs.createWriteStream(filePath).on('finish', () => {

                                const hash = _getFileHash(filePath);

                                _setSrc($elem, src, query, hash);

                                ++assetIndex;
                            }));

                        })($elem, filePath);
                    }
                    else{

                        filePath = path.join(outputPath, baseSrc);

                        const hash = _getFileHash(filePath);

                        _setSrc($elem, src, query, hash);

                        ++assetIndex;
                    }
                });
            });

            const timerId = setInterval(() => {

                if (assetLength === assetIndex){

                    fs.writeFileSync(templatePath, $.html());

                    // 리모트 파일 폴더를 삭제한다.
                    fse.removeSync(tmpAssetPath);

                    clearInterval(timerId);

                    callback();
                }
            }, 100);
        });
    };
}

/**
 * 엘리먼트 src 값을 할당한다.
 * @param $elem
 * @param src
 * @param query
 * @param hash
 * @private
 */
function _setSrc($elem = null, src = '', query = {}, hash = ''){

    if (!_.isEmpty(hash)){

        src = _.size(query) ? `${src}&v=${hash}` : `${src}?v=${hash}`;
    }

    if (_isScript($elem)) $elem.attr('src', src);
    else $elem.attr('href', src);
}

/**
 * Script 엘리먼트 여부를 반환한다.
 * @param $elem
 * @returns {boolean}
 * @private
 */
function _isScript($elem = null){
    return $elem.get(0).tagName === 'script' ? true : false;
}

/**
 * 리모트 파일 여부를 반환한다.
 * @param src
 * @returns {Array|{index: number, input: string}|RegExpMatchArray}
 * @private
 */
function _isRemoteFile(src = ''){

    const ptn = /^(http|https):\/\//;

    return src.match(ptn);
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


module.exports = InjectAssetsVersionPlugin;