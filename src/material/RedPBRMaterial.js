"use strict";
var RedPBRMaterial;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPBRMaterialProgram';
	var PROGRAM_OPTION_LIST = ['diffuseTexture', 'normalTexture', 'occlusionTexture', 'emissiveTexture', 'roughnessTexture', 'displacementTexture'];
	var checked;
	vSource = function () {
		/* @preserve
		 varying vec4 vVertexPositionEye4;
		 varying vec3 vReflectionCubeCoord;
		 //#define#displacementTexture# uniform sampler2D u_displacementTexture;
		 //#define#displacementTexture# uniform float u_displacementPower;
	     //#define#displacementTexture# uniform float u_displacementFlowSpeedX;
		 //#define#displacementTexture# uniform float u_displacementFlowSpeedY;

		 void main(void) {
			 vTexcoord = aTexcoord;
			 vVertexNormal = (uNMatrix * vec4(aVertexNormal,1.0)).xyz;

			//#define#skin#true# mat4 skinMat =
			//#define#skin#true# aVertexWeight.x * uGlobalTransformOfNodeThatTheMeshIsAttachedTo * uJointMatrix[ int(aVertexJoint.x) ] * uInverseBindMatrixForJoint[int(aVertexJoint.x)]+
			//#define#skin#true# aVertexWeight.y * uGlobalTransformOfNodeThatTheMeshIsAttachedTo * uJointMatrix[ int(aVertexJoint.y) ] * uInverseBindMatrixForJoint[int(aVertexJoint.y)]+
			//#define#skin#true# aVertexWeight.z * uGlobalTransformOfNodeThatTheMeshIsAttachedTo * uJointMatrix[ int(aVertexJoint.z) ] * uInverseBindMatrixForJoint[int(aVertexJoint.z)]+
			//#define#skin#true# aVertexWeight.w * uGlobalTransformOfNodeThatTheMeshIsAttachedTo * uJointMatrix[ int(aVertexJoint.w) ] * uInverseBindMatrixForJoint[int(aVertexJoint.w)];
			//#define#skin#true# vVertexPositionEye4 =  uMMatrix *  skinMat* vec4(aVertexPosition, 1.0) ;

			//#define#skin#false# vVertexPositionEye4 =  uMMatrix *  vec4(aVertexPosition, 1.0) ;

			 //#define#displacementTexture# vVertexPositionEye4.xyz += normalize(vVertexNormal) * texture2D(u_displacementTexture, vTexcoord + vec2(
			 //#define#displacementTexture#    u_displacementFlowSpeedX * (uTime/1000.0),
			 //#define#displacementTexture#    u_displacementFlowSpeedY * (uTime/1000.0)
		     //#define#displacementTexture# )).x * u_displacementPower ;

			 vReflectionCubeCoord = -vVertexPositionEye4.xyz;

			 gl_PointSize = uPointSize;
			 gl_Position = uPMatrix * uCameraMatrix * vVertexPositionEye4;
		 }
		 */
	};
	fSource = function () {
		/* @preserve
		 precision mediump float;
		 //#define#diffuseTexture# uniform sampler2D u_diffuseTexture;
		 //#define#normalTexture# uniform sampler2D u_normalTexture;
		 //#define#occlusionTexture# uniform sampler2D u_occlusionTexture;
		 uniform samplerCube u_environmentTexture;
		 //#define#emissiveTexture# uniform sampler2D u_emissiveTexture;
		 //#define#emissiveTexture# uniform sampler2D u_roughnessTexture;


         //#define#normalTexture# uniform float u_normalPower;
		 uniform float u_specularPower;
		 uniform float u_metallicPower;

		 uniform float u_alpha;

		 varying vec4 vVertexPositionEye4;
		 varying vec3 vReflectionCubeCoord;

		 float fogFactor(float perspectiveFar, float density){
			 float flog_cord = gl_FragCoord.z / gl_FragCoord.w / perspectiveFar;
			 float fog = flog_cord * density;
			 if(1.0 - fog < 0.0) discard;
			 return clamp(1.0 - fog, 0.0,  1.0);
		 }
		 vec4 fog(float fogFactor, vec4 fogColor, vec4 currentColor) {
			return mix(fogColor, currentColor, fogFactor);
		 }

		 vec4 la;
		 vec4 ld;
		 vec4 ls;
		 vec4 texelColor= vec4(0.0,0.0,0.0,0.0);
		 vec4 emissiveColor;
		 vec4 roughnessColor;
		 vec4 occlusionColor;
		 vec4 reflectionColor;
		 vec4 specularLightColor= vec4(1.0, 1.0, 1.0, 1.0);
		 vec4 finalColor;
		 vec3 N;
		 vec3 L;
	     float lambertTerm;
	     float specular;
	     float specularTextureValue;
         float distanceLength;
		 float attenuation;

		 void main(void) {
			 la = uAmbientLightColor * uAmbientLightColor.a;
			 ld = vec4(0.0, 0.0, 0.0, 1.0);
			 ls = vec4(0.0, 0.0, 0.0, 1.0);

			 texelColor = vec4(0.0,0.0,0.0,0.0);
			 //#define#diffuseTexture# texelColor = texture2D(u_diffuseTexture, vTexcoord);
			 //#define#diffuseTexture# texelColor.rgb *= texelColor.a;
			 //#define#diffuseTexture# if(texelColor.a ==0.0) discard;

			 //#define#emissiveTexture# emissiveColor = texture2D(u_emissiveTexture, vTexcoord);
			 //#define#emissiveTexture# emissiveColor.rgb *= emissiveColor.a;

			 //#define#roughnessTexture# roughnessColor = texture2D(u_roughnessTexture, vTexcoord);




			 N = normalize(vVertexNormal);
			 //#define#normalTexture# vec4 normalColor = texture2D(u_normalTexture, vTexcoord);
			 //#define#normalTexture# if(normalColor.a != 0.0) N = normalize(2.0 * (N + normalColor.rgb * u_normalPower  - 0.5));

			 reflectionColor = textureCube(u_environmentTexture, 2.0 * dot(vReflectionCubeCoord, N) * N - vReflectionCubeCoord);
			 float tMetallicPower = u_metallicPower;

			 // 메탈릭 산출 roughnessColor.b
			 //#define#roughnessTexture# tMetallicPower = tMetallicPower * roughnessColor.b;
             float shininess = 32.0 ;
             // 거칠기 산출 roughnessColor.g
			  // TODO

			 texelColor = mix(texelColor,reflectionColor ,tMetallicPower);

             //#define#occlusionTexture# occlusionColor = texture2D(u_occlusionTexture, vTexcoord);

			 specularLightColor = vec4(1.0, 1.0, 1.0, 1.0);
			 specularTextureValue = 1.0;


			 for(int i=0; i<cDIRETIONAL_MAX; i++){
				 if(i == uDirectionalLightNum) break;
				 L = normalize(-uDirectionalLightPositionList[i]);
				 lambertTerm = dot(N,-L);
				 if(lambertTerm > 0.0){
					 ld += uDirectionalLightColorList[i] * texelColor * lambertTerm * uDirectionalLightIntensityList[i] * uDirectionalLightColorList[i].a;
					 specular = pow( max(dot(reflect(L, N), -L), 0.0), shininess/tMetallicPower  ) ;
					 ls +=  specularLightColor * specular * u_specularPower * specularTextureValue * uDirectionalLightIntensityList[i]* uDirectionalLightColorList[i].a;
				 }
			 }

			 for(int i=0;i<cPOINT_MAX;i++){
				 if(i== uPointLightNum) break;
				 L =  -uPointLightPositionList[i] + vVertexPositionEye4.xyz;
				 distanceLength = length(L);
				 if(uPointLightRadiusList[i]> distanceLength){
					 attenuation = 1.0 / (0.01 + 0.02 * distanceLength + 0.03 * distanceLength * distanceLength);
					 L = normalize(L);
					 lambertTerm = dot(N,-L);
					 if(lambertTerm > 0.0){
						 ld += uPointLightColorList[i] * texelColor * lambertTerm * attenuation * uPointLightIntensityList[i] * uPointLightColorList[i].a;
						 specular = pow( max(dot(reflect(L, N), -L), 0.0), shininess/tMetallicPower );
						 ls +=  specularLightColor * specular * u_specularPower * specularTextureValue * uPointLightIntensityList[i] * uPointLightColorList[i].a ;
					 }
				 }
			 }
			 finalColor = la * uAmbientIntensity + ld + ls;
			 //#define#emissiveTexture# finalColor += emissiveColor;
			 finalColor.rgb *= texelColor.a;
			 finalColor.a = texelColor.a * u_alpha;
			 //#define#occlusionTexture# finalColor *= occlusionColor;
			 //#define#fog#false# gl_FragColor = finalColor;
			 //#define#fog#true# gl_FragColor = fog( fogFactor(u_FogDistance, u_FogDensity), uFogColor, finalColor);
		 }
		 */
	};
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedPBRMaterial`,
		 description : `
			 RedPBRMaterial Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 diffuseTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 environmentTexture : [
				 {type:'RedBitmapCubeTexture'}
			 ],
			 normalTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 occlusionTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 displacementTexture : [
				 {type:'RedBitmapTexture'}
			 ]
		 },
		 extends : [
		    'RedBaseMaterial'
		 ],
		 demo : '../example/material/RedPBRMaterial.html',
		 example : `
			 RedPBRMaterial(
				 RedGL Instance,
				 RedBitmapTexture(RedGL Instance, src), // diffuseTexture
				 RedBitmapCubeTexture(RedGL Instance, srcList),
				 RedBitmapTexture(RedGL Instance, src), // normalTexture
				 RedBitmapTexture(RedGL Instance, src), // occlusionTexture
				 RedBitmapTexture(RedGL Instance, src)  // displacementTexture
			 )
		 `,
		 return : 'RedPBRMaterial Instance'
	 }
	 :DOC*/
	RedPBRMaterial = function (redGL,
	                           diffuseTexture,
	                           environmentTexture,
	                           normalTexture,
	                           occlusionTexture,
	                           emissiveTexture,
	                           roughnessTexture,
	                           displacementTexture) {
		if ( !(this instanceof RedPBRMaterial) ) return new RedPBRMaterial(
			redGL,
			diffuseTexture,
			environmentTexture,
			normalTexture,
			occlusionTexture,
			emissiveTexture,
			roughnessTexture,
			displacementTexture
		);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedPBRMaterial : RedGL Instance만 허용.', redGL);
		environmentTexture instanceof RedBitmapCubeTexture || RedGLUtil.throwFunc('RedPBRMaterial : environmentTexture - RedBitmapCubeTexture Instance만 허용.');
		this.makeProgramList(this, redGL, PROGRAM_NAME, vSource, fSource, PROGRAM_OPTION_LIST);
		/////////////////////////////////////////
		// 유니폼 프로퍼티
		this['diffuseTexture'] = diffuseTexture;
		this['environmentTexture'] = environmentTexture;
		this['normalTexture'] = normalTexture;
		this['occlusionTexture'] = occlusionTexture;
		this['displacementTexture'] = displacementTexture;
		this['emissiveTexture'] = emissiveTexture;
		this['roughnessTexture'] = roughnessTexture;
		this['normalPower'] = 1;
		this['specularPower'] = 1;
		this['metallicPower'] = 1;
		this['displacementPower'] = 0;
		this['displacementFlowSpeedX'] = 0;
		this['displacementFlowSpeedY'] = 0;
		this['alpha'] = 1;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['_UUID'] = RedGL.makeUUID();
		if ( !checked ) {
			this.checkUniformAndProperty();
			checked = true;
		}
		console.log(this);
	};
	RedPBRMaterial.prototype = new RedBaseMaterial();
	var samplerOption = {
		callback: function () {
			this._searchProgram(PROGRAM_NAME, PROGRAM_OPTION_LIST)
		}
	};
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`alpha`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'alpha', 'number', {min: 0, max: 1});
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`diffuseTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'diffuseTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`environmentTexture`,
		 return : 'RedBitmapCubeTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'environmentTexture', 'samplerCube', {
		essential: true,
		callback: samplerOption.callback
	});
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`normalTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'normalTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`occlusionTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'occlusionTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`displacementTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'displacementTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`emissiveTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'emissiveTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`roughnessTexture`,
		 return : 'RedBitmapTexture'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'roughnessTexture', 'sampler2D', samplerOption);
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`normalPower`,
		 description : `기본값 : 1`,
		 return : 'number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'normalPower', 'number', {'min': 0});

	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`specularPower`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'specularPower', 'number', {'min': 0});
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`metallicPower`,
		 description : `기본값 : 1`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'metallicPower', 'number', {'min': 0});

	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`displacementPower`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'displacementPower', 'number', {'min': 0});
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`displacementFlowSpeedX`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'displacementFlowSpeedX', 'number');
	/**DOC:
	 {
	     code : 'PROPERTY',
		 title :`displacementFlowSpeedY`,
		 description : `기본값 : 0`,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedPBRMaterial', 'displacementFlowSpeedY', 'number');
	Object.freeze(RedPBRMaterial);
})();