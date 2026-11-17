require('es6-promise').polyfill();
require('isomorphic-fetch');

export class SvgSprite {
    constructor(svgURL: string) {
        let url = svgURL;
        // Override the svg path in the view
        const urlOverride = document.querySelector('#svgSpriteUrl') as HTMLInputElement;
        if (urlOverride) url = urlOverride.value;

        const sprite = document.querySelector('#svgSprite');
        if (!sprite) {
            window.fetch(url)
                .then(response => {
                    if (response.status !== 200) {
                        throw "SVG sprite load failed. Status code: " + response.status;
                    } else {
                        return response.text();
                    }
                })
                .then(svg => this.injectSvg(svg));
        }
    }

    injectSvg(data) {
        if (data !== undefined) {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = data;
            document.body.insertBefore(newDiv, document.body.childNodes[0]);
        }
    }
}