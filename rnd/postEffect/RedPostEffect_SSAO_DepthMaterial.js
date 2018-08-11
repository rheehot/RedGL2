"use strict";
var RedPostEffect_SSAO_DepthMaterial;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPostEffectSSAOdepthProgram';
	vSource = function () {
		/* @preserve
		 varying vec3 vCameraPosition;

		 mat4 calSprite3D(mat4 cameraMTX, mat4 mvMatrix){
			 mat4 cacheScale = mat4(
			 mvMatrix[0][0], 0.0, 0.0, 0.0,
			 0.0, mvMatrix[1][1], 0.0, 0.0,
			 0.0, 0.0, 1.0, mvMatrix[2][2],
			 0.0, 0.0, 0.0, 1.0
			 );
			 mat4 tMTX = cameraMTX * mvMatrix;
			 tMTX[0][0] = 1.0, tMTX[0][1] = 0.0, tMTX[0][2] = 0.0,
			 tMTX[1][0] = 0.0, tMTX[1][1] = 1.0, tMTX[1][2] = 0.0,
			 tMTX[2][0] = 0.0, tMTX[2][1] = 0.0, tMTX[2][2] = 1.0;
			 return tMTX * cacheScale;
		 }
		 void main(void) {

			 gl_PointSize = uPointSize;
			 //#define#sprite3D#true# gl_Position = uPMatrix * calSprite3D(uCameraMatrix , uMMatrix) *  vec4(aVertexPosition, 1.0);
			//#define#sprite3D#true# if(!u_PerspectiveScale){
			//#define#sprite3D#true#   gl_Position /= gl_Position.w;
			//#define#sprite3D#true#   gl_Position.xy += aVertexPosition.xy * vec2(uMMatrix[0][0],uMMatrix[1][1] * uResolution.x/uResolution.y);
			//#define#sprite3D#true# }
			//#define#sprite3D#false# gl_Position = uPMatrix * uCameraMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);
			 mat4 test = uPMatrix * uCameraMatrix;
			 vCameraPosition = vec3(test[3][0], test[3][1], test[3][2]);

		 }
		 */
	}
	fSource = function () {
		/* @preserve
		 precision mediump float;
		 varying vec3 vCameraPosition;
		 uniform float uFocusLength;

		 highp vec4 pack_depth(  highp float depth ) {
			 const highp vec4 cBit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
			 const highp vec4 cBit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
			 highp vec4 res = fract( depth * cBit_shift );
			 res -= res.xxyz * cBit_mask;
			 return res;
		 }

		 //http://www.nutty.ca/?page_id=352&amp;link=shadow_map
		 highp vec4 pack_depth2 (highp float depth)
		 {
			 const highp vec4 cBias = vec4(1.0 / 255.0,
			 1.0 / 255.0,
			 1.0 / 255.0,
			 1.0);

			 highp float r = depth;
			 highp float g = fract(r * 255.0);
			 highp float b = fract(g * 255.0);
			 highp float a = fract(b * 255.0);
			 highp vec4 colour = vec4(r, g, b, a);
		     return colour - (colour.yzww * cBias);
		 }


		 void main(void) {
			 gl_FragColor = pack_depth2( gl_FragCoord.z );
			 gl_FragColor.a = 1.0;
		 }
		 */
	}
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedPostEffect_SSAO_DepthMaterial`,
		 description : `
		    <h1>연구중</h1>
			 RedPostEffect_SSAO_DepthMaterial Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 extends : [
		    'RedBasePostEffect',
		    'RedBaseMaterial'
		 ],
		 example : `
			 RedPostEffect_SSAO_DepthMaterial(RedGL Instance)
		 `,
		 return : 'RedPostEffect_SSAO_DepthMaterial Instance'
	 }
	 :DOC*/
	RedPostEffect_SSAO_DepthMaterial = function (redGL) {
		if ( !(this instanceof RedPostEffect_SSAO_DepthMaterial) ) return new RedPostEffect_SSAO_DepthMaterial(redGL);
		/////////////////////////////////////////
		// 유니폼 프로퍼티
		this['focusLength'] = 1000
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['program'] = RedProgram['makeProgram'](redGL, PROGRAM_NAME, vSource, fSource);
		this['_UUID'] = RedGL.makeUUID();
		this.checkUniformAndProperty();
		console.log(this);
	}
	RedPostEffect_SSAO_DepthMaterial.prototype = new RedBasePostEffect()
	Object.freeze(RedPostEffect_SSAO_DepthMaterial)
})();