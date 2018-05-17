"use strict";
var RedPostEffect_SSAO_PointMaker;
(function () {
    var makeProgram;
    /**DOC:
       {
           constructorYn : true,
           title :`RedPostEffect_SSAO_PointMaker`,
           description : `
               RedPostEffect_SSAO_PointMaker Instance 생성.
           `,
           params : {
               redGL : [
                   {type:'RedGL'}
               ]
           },
           return : 'RedPostEffect_SSAO_PointMaker Instance'
       }
   :DOC*/
    RedPostEffect_SSAO_PointMaker = function (redGL) {
        if (!(this instanceof RedPostEffect_SSAO_PointMaker)) return new RedPostEffect_SSAO_PointMaker(redGL);
        if (!(redGL instanceof RedGL)) RedGLUtil.throwFunc('RedPostEffect_SSAO_PointMaker : RedGL Instance만 허용됩니다.', redGL)
        this['frameBuffer'] = RedFrameBuffer(redGL);
        this['subSceneFrameBuffer'] = RedFrameBuffer(redGL);
        this['subSceneMaterial'] = RedPostEffect_SSAO_DepthMaterial(redGL);

    
        this['processSubSceneFrameBuffer'] = [
            RedPostEffect_BrightnessContrast(redGL),
            RedPostEffect_BlurX(redGL),
            RedPostEffect_BlurY(redGL)
        ]

        this['diffuseTexture'] = null
        this['depthTexture'] = null;
        this['factor'] = 10;
        this['factor2'] = 0.2;
        this['size'] = 3;

        /////////////////////////////////////////
        // 일반 프로퍼티
        this['program'] = makeProgram(this, redGL);
        this['_UUID'] = RedGL['makeUUID']();


        this.updateTexture = function (lastFrameBufferTexture, parentFramBufferTexture) {
            this['diffuseTexture'] = lastFrameBufferTexture;
            this['depthTexture'] = this['subSceneFrameBuffer']['texture'];
        }
        this['bind'] = RedPostEffectManager.prototype['bind'];
        this['unbind'] = RedPostEffectManager.prototype['unbind'];
        this.checkProperty();
        console.log(this);
    }
    makeProgram = (function () {
        var vSource, fSource;
        var PROGRAM_NAME;
        vSource = function () {
            /*
         
            void main(void) {
                vTexcoord = uAtlascoord.xy + aTexcoord * uAtlascoord.zw;
                vResolution = uResolution;
                vTime = uTime;
                gl_Position = uPMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);

            }
            */
        }
        fSource = function () {
            /*
            precision mediump float;
    
            uniform sampler2D uDiffuseTexture;   
            uniform sampler2D uDepthTexture;    
            
            uniform float uFactor;
            uniform float uFactor2;
            uniform float uSize;

            float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   
            float PI  = 3.14159265358979323846264 * 00000.1; // PI
            float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two
          

            float random(vec3 scale, float seed) {
                return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
            }
            void main() {

                vec2 tLocation = gl_FragCoord.xy/vResolution ;
                tLocation = vTexcoord;
                vec4 finalColor = texture2D(uDiffuseTexture, tLocation);  
                vec4 depthColor = texture2D(uDepthTexture, tLocation);  
                const int SAMPLES = 8;
                float ao = 0.0;
                for (int i = 0; i < SAMPLES; ++i) {
                    float rand = random(vec3(tLocation, gl_FragCoord.w), 0.0) * uFactor ;         
                    vec2 offset;                    
                    if(i==0) offset = vec2(rand/vResolution.x, rand/vResolution.y);
                    else if(i==1) offset = vec2(-rand/vResolution.x, rand/vResolution.y);
                    else if(i==2) offset = vec2(rand/vResolution.x, -rand/vResolution.y);
                    else if(i==3) offset = vec2(-rand/vResolution.x, -rand/vResolution.y);

                    else if(i==4) offset = vec2(rand/2.0/vResolution.x, sqrt(rand*rand + rand*rand)/vResolution.y);
                    else if(i==5) offset = vec2(-rand/2.0/vResolution.x, sqrt(rand*rand + rand*rand)/vResolution.y);
                    else if(i==6) offset = vec2(rand/2.0/vResolution.x, -sqrt(rand*rand + rand*rand)/vResolution.y);
                    else if(i==7) offset = vec2(-rand/2.0/vResolution.x, -sqrt(rand*rand + rand*rand)/vResolution.y);
                    

                    vec2 tLocation2 = tLocation + offset   ;

                    if(tLocation2.x <0.0) continue;
                    else if(tLocation2.x >1.0) continue;
                    else if(tLocation2.y <0.0) continue;
                    else if(tLocation2.y >1.0) continue;
                    else {
                        float sampleDepth = texture2D(uDepthTexture, tLocation2).r;
                        // if(sampleDepth < 0.9){
                            if(abs((sampleDepth - depthColor.r)) < 0.5){
                                if(sampleDepth > depthColor.r) ao+= 1.0/float(SAMPLES) * abs(normalize(sampleDepth - depthColor.r)) ;                
                            }
                        // }
                        
                    }
                }
                // ao /= float(SAMPLES);
                ao = 1.0 - ao;
                ao = pow(ao, uFactor2);
                gl_FragColor = vec4(ao,ao,ao,1.0);
                // gl_FragColor = depthColor;
                
            }
            */
        }
        vSource = RedGLUtil.getStrFromComment(vSource.toString());
        fSource = RedGLUtil.getStrFromComment(fSource.toString());
        PROGRAM_NAME = 'RedPostEffect_SSAO_PointMaker_Program';
        return function (target, redGL) {
            return target['checkProgram'](redGL, PROGRAM_NAME, vSource, fSource);
        }
    })();
    RedPostEffect_SSAO_PointMaker.prototype = RedBaseMaterial.prototype;
    Object.freeze(RedPostEffect_SSAO_PointMaker);
})();