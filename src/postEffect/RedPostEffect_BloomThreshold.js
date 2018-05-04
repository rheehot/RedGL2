"use strict";
var RedPostEffect_BloomThreshold;
(function () {
    var makeProgram;

    RedPostEffect_BloomThreshold = function (redGL) {
        if (!(this instanceof RedPostEffect_BloomThreshold)) return new RedPostEffect_BloomThreshold(redGL);
        if (!(redGL instanceof RedGL)) RedGLUtil.throwFunc('RedPostEffect_BloomThreshold : RedGL Instance만 허용됩니다.', redGL)
        this['frameBuffer'] = RedFrameBuffer(redGL);
        this['diffuseTexture'] = null;
        /////////////////////////////////////////
        // 일반 프로퍼티
        this['program'] = makeProgram(this, redGL);
        this['_UUID'] = RedGL['makeUUID']();

        // Object.seal(this)
        console.log(this)
        this['threshold'] = 0.24



        this.checkProperty()
        this.updateTexture = function (lastFrameBufferTexture) {
            this['diffuseTexture'] = lastFrameBufferTexture;
        }
        this.bind = function (gl) {
            this['frameBuffer'].bind(gl);
        }
        this.unbind = function (gl) {
            this['frameBuffer'].unbind(gl);
        }
    }
    makeProgram = (function () {
        var vSource, fSource;
        var PROGRAM_NAME;
        vSource = function () {
            /*
            void main(void) {
                vTexcoord = uAtlascoord.xy + aTexcoord * uAtlascoord.zw;
                gl_Position = uPMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);
            }
            */
        }
        fSource = function () {
            /*
            precision highp float;
            uniform sampler2D uDiffuseTexture;     
            uniform float uThreshold;
            
            void main() {
                vec4 finalColor = texture2D(uDiffuseTexture, vTexcoord);
                if(0.2126 * finalColor.r + 0.7152 * finalColor.g + 0.0722 * finalColor.b < uThreshold)  finalColor.r = finalColor.g = finalColor.b = 0.0;
                gl_FragColor = finalColor;          
            }
            */
        }
        vSource = RedGLUtil.getStrFromComment(vSource.toString());
        fSource = RedGLUtil.getStrFromComment(fSource.toString());
        PROGRAM_NAME = 'RedPostEffect_BloomThreshold_Program';
        return function (target, redGL) {
            return target['checkProgram'](redGL, PROGRAM_NAME, vSource, fSource)

        }
    })();
    RedPostEffect_BloomThreshold.prototype = RedBaseMaterial.prototype
    Object.freeze(RedPostEffect_BloomThreshold)
})();