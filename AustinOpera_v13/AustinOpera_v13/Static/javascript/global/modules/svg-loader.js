"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgSprite = void 0;
require('es6-promise').polyfill();
require('isomorphic-fetch');
var SvgSprite = /** @class */ (function () {
    function SvgSprite(svgURL) {
        var _this = this;
        var url = svgURL;
        // Override the svg path in the view
        var urlOverride = document.querySelector('#svgSpriteUrl');
        if (urlOverride)
            url = urlOverride.value;
        var sprite = document.querySelector('#svgSprite');
        if (!sprite) {
            window.fetch(url)
                .then(function (response) {
                if (response.status !== 200) {
                    throw "SVG sprite load failed. Status code: " + response.status;
                }
                else {
                    return response.text();
                }
            })
                .then(function (svg) { return _this.injectSvg(svg); });
        }
    }
    SvgSprite.prototype.injectSvg = function (data) {
        if (data !== undefined) {
            var newDiv = document.createElement('div');
            newDiv.innerHTML = data;
            document.body.insertBefore(newDiv, document.body.childNodes[0]);
        }
    };
    return SvgSprite;
}());
exports.SvgSprite = SvgSprite;
//# sourceMappingURL=svg-loader.js.map