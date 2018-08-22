"use strict";
var RedGLTFLoader;
(function () {
	var parser
	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedGLTFLoader`,
		 description : `
			 OBJ 로더
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 path : [
				 {type:'String'}
			 ],
			 fileName : [
				 {type:'String'}
			 ],
			 callback : [
				 {type:'Function'}
			 ]
		 },
		 return : 'void'
	 }
	 :DOC*/

	var fileLoader = function (src, type, onLoader, onError) {
		var request = new XMLHttpRequest();
		request.open("GET", src, true);
		request.setRequestHeader("Content-Type", (type ? type : "application/xml; " ) + 'charset=UTF-8')
		request.onreadystatechange = function (e) {
			if ( request.readyState == 4 && request.status === 200 ) {
				console.log(request)
				onLoader(request)
			} else {
				onError(request, e)
			}
		}
		request.send();
	}
	var arrayBufferLoader = function (src, onLoader, onError) {
		var request = new XMLHttpRequest();
		request.open("GET", src, true);
		request.overrideMimeType('application/octet-stream')
		request.responseType = "arraybuffer";
		request.onreadystatechange = function (e) {
			if ( request.readyState == 4 && request.status === 200 ) {
				console.log(request)
				onLoader(request)
			} else {
				onError(request, e)
			}
		}
		request.send();
	}
	RedGLTFLoader = function (redGL, path, fileName, callback) {
		if ( (!(this instanceof RedGLTFLoader)) ) return new RedGLTFLoader(redGL, path, fileName, callback)
		console.log('~~~~~~~~~~~')
		var self = this;
		fileLoader(
			path + fileName,
			null,
			function (request) {
				self['result'] = parser(self, redGL, JSON.parse(request['responseText']), function () {
					if ( callback ) {
						console.log('모델 파싱 종료');
						callback(self['result'])
					}
				})
			},
			function (request, error) {
				console.log(request, error)
			}
		)
		this['uris'] = {
			buffers: []
		};
		this['redGL'] = redGL;
		this['groups'] = []
		this['skins'] = []
		this['animations'] = [];
		this['aniTick'] = null
		this['path'] = path;
		this['fileName'] = fileName;
		this['callback'] = callback;
		this['resultMesh'] = RedMesh(redGL)
		this['resultMesh']['name'] = 'instanceOfRedGLTFLoader_' + RedGL.makeUUID()
		this['result'] = null;
		var _currentAnimationInfo = null
		this['stopAnimation'] = function () {
			console.log('_currentAnimationInfo', _currentAnimationInfo, loopList.indexOf(_currentAnimationInfo))
			if ( loopList.indexOf(_currentAnimationInfo) > -1 ) {
				loopList.splice(loopList.indexOf(_currentAnimationInfo), 1)
			}
			console.log('loopList', loopList)
		}
		this['playAnimation'] = function (animationData) {
			loopList.push(
				_currentAnimationInfo = {
					startTime: performance.now(),
					targetAnimationData: animationData
				}
			)
			console.log('loopList', loopList)
		}
		console.log(this)
	};
	var loopList = []
	var animationLooper = (function () {
		var currentTime, previousTime, nextTime;
		var prevRotation, nextRotation;
		var prevTranslation, nextTranslation;
		var prevScale, nextScale;
		var interpolationValue;
		var targetAnimationData
		return function (time) {
			loopList.forEach(function (v) {
				prevRotation = null
				nextRotation = null
				prevTranslation = null
				nextTranslation = null
				targetAnimationData = v['targetAnimationData']
				targetAnimationData.forEach(function (aniData) {
					currentTime = ((time - v['startTime']) % (targetAnimationData['maxTime'] * 1000)) / 1000
					// console.log(currentTime,aniData['minTime'] )
					var target = aniData['target']
					var nextIndex, prevIndex
					prevIndex = aniData['time'].length - 1
					nextIndex = 0
					previousTime = aniData['time'][prevIndex]
					nextTime = aniData['time'][nextIndex]
					var len = aniData['time'].length
					var i = 0
					for ( i; i < len; i++ ) {
						var tTime = aniData['time'][i]
						var index = i
						if ( tTime < currentTime ) {
							prevIndex = index
							previousTime = aniData['time'][prevIndex]
							if ( aniData['time'][prevIndex + 1] == undefined ) {
								nextIndex = 0
								nextTime = aniData['time'][nextIndex]
							} else {
								nextIndex = prevIndex + 1
								nextTime = aniData['time'][nextIndex]
							}
						}
						if ( index == 0 && (currentTime < aniData['time'][i]) ) {
							prevIndex = len - 1
							previousTime = aniData['time'][prevIndex]
							nextIndex = index
							nextTime = aniData['time'][nextIndex]
							currentTime = tTime
							break
						}
						if ( index == len - 1 && (currentTime > tTime) ) {
							prevIndex = 0
							previousTime = aniData['time'][prevIndex]
							nextIndex = len - 1
							nextTime = aniData['time'][nextIndex]
							currentTime = tTime
							break
						}
					}
					if ( aniData['key'] == 'rotation' ) {
						// var rotationMTX = mat4.create()
						// var tRotation = [0, 0, 0]
						var tQuaternion = [
							aniData['data'][nextIndex * 4],
							aniData['data'][nextIndex * 4 + 1],
							aniData['data'][nextIndex * 4 + 2],
							aniData['data'][nextIndex * 4 + 3]
						]
						// RedGLUtil.quaternionToRotationMat4(tQuaternion, rotationMTX)
						// RedGLUtil.mat4ToEuler(rotationMTX, tRotation)
						// tRotation[0] = -(tRotation[0] * 180 / Math.PI)
						// tRotation[1] = -(tRotation[1] * 180 / Math.PI)
						// tRotation[2] = -(tRotation[2] * 180 / Math.PI)
						nextRotation = tQuaternion
						//
						// var rotationMTX = mat4.create()
						// var tRotation = [0, 0, 0]
						var tQuaternion = [
							aniData['data'][prevIndex * 4],
							aniData['data'][prevIndex * 4 + 1],
							aniData['data'][prevIndex * 4 + 2],
							aniData['data'][prevIndex * 4 + 3]
						]
						// RedGLUtil.quaternionToRotationMat4(tQuaternion, rotationMTX)
						// RedGLUtil.mat4ToEuler(rotationMTX, tRotation)
						// tRotation[0] = -(tRotation[0] * 180 / Math.PI)
						// tRotation[1] = -(tRotation[1] * 180 / Math.PI)
						// tRotation[2] = -(tRotation[2] * 180 / Math.PI)
						prevRotation = tQuaternion
					}
					if ( aniData['key'] == 'translation' ) {
						nextTranslation = [
							aniData['data'][nextIndex * 3],
							aniData['data'][nextIndex * 3 + 1],
							aniData['data'][nextIndex * 3 + 2]
						]
						prevTranslation = [
							aniData['data'][prevIndex * 3],
							aniData['data'][prevIndex * 3 + 1],
							aniData['data'][prevIndex * 3 + 2]
						]
					}
					if ( aniData['key'] == 'scale' ) {
						nextScale = [
							aniData['data'][nextIndex * 3],
							aniData['data'][nextIndex * 3 + 1],
							aniData['data'][nextIndex * 3 + 2]
						]
						prevScale = [
							aniData['data'][prevIndex * 3],
							aniData['data'][prevIndex * 3 + 1],
							aniData['data'][prevIndex * 3 + 2]
						]
					}
					interpolationValue = (currentTime - previousTime) / (nextTime - previousTime)
					if ( target ) {
						if ( aniData['key'] == 'translation' ) {
							target.x = prevTranslation[0] + interpolationValue * (nextTranslation[0] - prevTranslation[0])
							target.y = prevTranslation[1] + interpolationValue * (nextTranslation[1] - prevTranslation[1])
							target.z = prevTranslation[2] + interpolationValue * (nextTranslation[2] - prevTranslation[2])
							// console.log(target.y)
						}
						if ( aniData['key'] == 'rotation' ) {
							var tQuat = []
							// quat lerp start
							var ax = prevRotation[0];
							var ay = prevRotation[1];
							var az = prevRotation[2];
							var aw = prevRotation[3];
							tQuat[0] = ax + interpolationValue * (nextRotation[0] - ax);
							tQuat[1] = ay + interpolationValue * (nextRotation[1] - ay);
							tQuat[2] = az + interpolationValue * (nextRotation[2] - az);
							tQuat[3] = aw + interpolationValue * (nextRotation[3] - aw);
							// quat lerp end
							// quat.lerp(tt, prevRotation, nextRotation, interpolationValue)
							var rotationMTX = []
							var tRotation = [0, 0, 0]
							RedGLUtil.quaternionToRotationMat4(tQuat, rotationMTX)
							RedGLUtil.mat4ToEuler(rotationMTX, tRotation)
							tRotation[0] = -(tRotation[0] * 180 / Math.PI)
							tRotation[1] = -(tRotation[1] * 180 / Math.PI)
							tRotation[2] = -(tRotation[2] * 180 / Math.PI)
							target.rotationX = tRotation[0]
							target.rotationY = tRotation[1]
							target.rotationZ = tRotation[2]
							// console.log(prevIndex, nextIndex)
							// console.log(parseInt(prevRotation[2]), parseInt(nextRotation[2]))
							// console.log(target.rotationX ,target.rotationY ,target.rotationZ )
						}
						if ( aniData['key'] == 'scale' ) {
							target.scaleX = prevScale[0] + interpolationValue * (nextScale[0] - prevScale[0])
							target.scaleY = prevScale[1] + interpolationValue * (nextScale[1] - prevScale[1])
							target.scaleZ = prevScale[2] + interpolationValue * (nextScale[2] - prevScale[2])
						}
						if ( aniData['key'] == 'weights' ) {
							// console.log(aniData)
							var targetMesh = aniData['target']
							var targetData = targetMesh['geometry']['interleaveBuffer']['data']
							var originData = targetMesh['_morphInfo']['origin']
							targetData.forEach(function (v, index) {
								var prev, next
								prev = originData[index]
								next = originData[index]
								targetMesh['_morphInfo']['list'].forEach(function (v, morphIndex) {
									prev += aniData['data'][prevIndex * 2 + morphIndex] * v['interleaveData'][index]
									next += aniData['data'][nextIndex * 2 + morphIndex] * v['interleaveData'][index]
								})
								targetData[index] = prev + interpolationValue * (next - prev)
							})
							targetMesh['geometry']['interleaveBuffer'].upload(targetData)
						}
					}
				})
			})
			requestAnimationFrame(animationLooper);
		}
	})();
	requestAnimationFrame(animationLooper);
	parser = (function () {
		var checkAsset;
		var getBaseResource;
		var getBufferResources;
		var parseScene;
		var makeMesh;
		var parseAnimations;
		var parseNode;
		var checkTRSAndMATRIX;
		/*
			glTF는 asset 속성이 있어야한다.
			최소한 버전을 반드시 포함해야함.
		 */
		checkAsset = function (json) {
			// console.log(json)
			if ( json['asset'] === undefined ) RedGLUtil.throwFunc('RedGLTFLoader - asset은 반드시 정의되어야함')
			if ( json['asset'].version[0] < 2 ) RedGLUtil.throwFunc('RedGLTFLoader - asset의 버전은 2.0이상이어야함')
		}
		getBufferResources = function (redGLTFLoader, data, callback) {
			var allNum = 0, loadedNum = 0
			var tList = []
			data['buffers'].forEach(function (v, index) {
				v['_redURIkey'] = 'buffers'
				v['_redURIIndex'] = index
				tList.push(v)
			})
			tList.forEach(function (v) {
				console.log('버퍼테이터', v)
				allNum++
				var tSrc = v['uri'].substr(0, 5) == 'data:' ? v['uri'] : redGLTFLoader['path'] + v['uri']
				// console.log('tSrc', tSrc)
				arrayBufferLoader(
					tSrc,
					function (request) {
						loadedNum++
						console.log(request)
						// console.log(request.response)
						redGLTFLoader['uris'][v['_redURIkey']][v['_redURIIndex']] = new DataView(request.response);
						if ( loadedNum == allNum ) {
							console.log("redGLTFLoader['uris']", redGLTFLoader['uris'])
							console.log("uris로딩현황", loadedNum, loadedNum)
							if ( callback ) callback()
						}
					},
					function (request, error) {
						console.log(request, error)
					}
				)
			})
		}
		/*
			전체 데이터중 외부소스데이터를 모두 실제화 해둔다.
		 */
		getBaseResource = function (redGLTFLoader, json, callback) {
			for ( var k in json ) {
				console.log(k, json[k])
				switch ( k ) {
					case 'scenes' :
						console.log('TODO : scene 내부 리소스 로딩');
						break;
					case 'nodes' :
						console.log('TODO : nodes 내부 리소스 로딩');
						break;
					case 'meshes' :
						console.log('TODO : meshes 내부 리소스 로딩');
						break;
					case 'buffers' :
						console.log('TODO : buffers 내부 리소스 로딩');
						break;
					case 'bufferViews ' :
						console.log('TODO : bufferViews 내부 리소스 로딩');
						break;
					case 'accessors ' :
						console.log('TODO : accessors 내부 리소스 로딩');
						break;
					case 'images ' :
						console.log('TODO : images 내부 리소스 로딩');
						break;
					default :
						console.log(k, '고려안한거임');
						break;
				}
			}
			getBufferResources(redGLTFLoader, json, callback);
		}
		parseScene = function (redGLTFLoader, json) {
			console.log('parseScene 시작')
			console.log(json)
			json['scenes'][0]['nodes'].forEach(function (nodeIndex, index) {
				console.log('노드를 찾음', nodeIndex)
				parseNode(redGLTFLoader, json, nodeIndex, json['nodes'][nodeIndex], redGLTFLoader['resultMesh'])
			})
		}
		checkTRSAndMATRIX = (function () {
			var rotationMTX = mat4.create()
			var tRotation = [0, 0, 0]
			var tQuaternion = []
			var tScale = []
			var tMatrix
			return function (target, info) {
				if ( 'matrix' in info ) {
					// parseMatrix
					tMatrix = info['matrix']
					mat4.getRotation(tQuaternion, tMatrix)
					RedGLUtil.quaternionToRotationMat4(tQuaternion, rotationMTX)
					RedGLUtil.mat4ToEuler(rotationMTX, tRotation)
					target.rotationX = -(tRotation[0] * 180 / Math.PI)
					target.rotationY = -(tRotation[1] * 180 / Math.PI)
					target.rotationZ = -(tRotation[2] * 180 / Math.PI)
					target.x = tMatrix[12]
					target.y = tMatrix[13]
					target.z = tMatrix[14]
					mat4.getScaling(tScale, tMatrix)
					target.scaleX = tScale[0]
					target.scaleY = tScale[1]
					target.scaleZ = tScale[2]
				}
				if ( 'rotation' in info ) {
					// 로데이션은 쿼터니언으로 들어온다.
					tQuaternion = info['rotation'];
					RedGLUtil.quaternionToRotationMat4(tQuaternion, rotationMTX)
					RedGLUtil.mat4ToEuler(rotationMTX, tRotation)
					target.rotationX = -(tRotation[0] * 180 / Math.PI)
					target.rotationY = -(tRotation[1] * 180 / Math.PI)
					target.rotationZ = -(tRotation[2] * 180 / Math.PI)
				}
				if ( 'translation' in info ) {
					// 위치 
					target.x = info['translation'][0];
					target.y = info['translation'][1];
					target.z = info['translation'][2];
				}
				if ( 'scale' in info ) {
					// 스케일
					target.scaleX = info['scale'][0];
					target.scaleY = info['scale'][1];
					target.scaleZ = info['scale'][2];
				}
			}
		})();
		var parseSkin = function (redGLTFLoader, json, info, tMesh) {
			console.log('스킨설정!', info)
			var skinInfo = {
				joints: [],
				inverseBindMatrices: []
			}
			var nodes = json['nodes']
			info['joints'].forEach(function (v) {
				// console.log(json['nodes'][v])
				var tJointMesh = nodes[v]['RedMesh']
				skinInfo['joints'].push(tJointMesh)
				tJointMesh.geometry = RedSphere(redGLTFLoader['redGL'], 0.05, 3, 3, 3)
				tJointMesh.material = RedColorMaterial(redGLTFLoader['redGL'])
				tJointMesh.drawMode = redGLTFLoader['redGL'].gl.LINE_LOOP
				tJointMesh.depthTestFunc = redGLTFLoader['redGL'].gl.ALWAYS
			})
			// 스켈레톤 정보가 있으면 정보와 메쉬를 연결해둔다.
			if ( info['skeleton'] ) skinInfo['skeleton'] = json['nodes'][info['skeleton']]['RedMesh']
			// 액세서 구하고..
			// 정보 파싱한다.
			var accessorIndex = info['inverseBindMatrices']
			var accessorInfo = new RedGLTF_AccessorInfo(redGLTFLoader, json, accessorIndex)
			var tBYTES_PER_ELEMENT = accessorInfo['componentType_BYTES_PER_ELEMENT'];
			var tBufferViewByteStride = accessorInfo['bufferViewByteStride'];
			var tBufferURIDataView = accessorInfo['bufferURIDataView'];
			var tGetMethod = accessorInfo['getMethod'];
			var tType = accessorInfo['accessor']['type'];
			var tCount = accessorInfo['accessor']['count'];
			var strideIndex = 0;
			var stridePerElement = tBufferViewByteStride / tBYTES_PER_ELEMENT
			var i = accessorInfo['startIndex']
			var len
			switch ( tType ) {
				case 'MAT4' :
					if ( tBufferViewByteStride ) {
						len = i + tCount * (tBufferViewByteStride / tBYTES_PER_ELEMENT)
						for ( i; i < len; i++ ) {
							if ( strideIndex % stridePerElement < 16 ) {
								skinInfo['inverseBindMatrices'].push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							}
							strideIndex++
						}
					} else {
						len = i + tCount * 16;
						for ( i; i < len; i++ ) {
							skinInfo['inverseBindMatrices'].push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
						}
					}
					break
				default :
					console.log('알수없는 형식 엑세서 타입', tType)
					break
			}
			skinInfo['inverseBindMatrices'] = new Float32Array(skinInfo['inverseBindMatrices'])
			tMesh['skinInfo'] = skinInfo
			console.log(skinInfo)
		}
		parseNode = function (redGLTFLoader, json, nodeIndex, info, parentMesh) {
			if ( 'mesh' in info ) {
				var tMeshIndex = info['mesh']
				// console.log('nodeInfo', info)
				// console.log('parentMesh', parentMesh)
				makeMesh(redGLTFLoader, json, json['meshes'][tMeshIndex]).forEach(function (tMesh) {
					info['RedMesh'] = tMesh
					parentMesh.addChild(tMesh)
					// console.log("메쉬인덱스를 찾음", tMeshIndex, parentMesh)
					checkTRSAndMATRIX(tMesh, info)
					// tMesh.matrix = matrix
					// tMesh.autoUpdateMatrix = false
					if ( 'children' in info ) {
						info['children'].forEach(function (index) {
							parseNode(redGLTFLoader, json, index, json['nodes'][index], tMesh)
						})
					}
					if ( 'skin' in info ) parseSkin(redGLTFLoader, json, json['skins'][info['skin']], tMesh)
				})
			}
			else {
				var tGroup
				console.log('차일드 정보로 구성된 정보임', info)
				tGroup = RedMesh(redGLTFLoader['redGL'])
				parentMesh.addChild(tGroup)
				info['RedMesh'] = tGroup
				if ( redGLTFLoader['groups'][nodeIndex] ) console.log('기존에 존재!', redGLTFLoader['groups'][nodeIndex])
				redGLTFLoader['groups'][nodeIndex] = tGroup
				redGLTFLoader['groups'][nodeIndex]['name'] = 'group' + nodeIndex
				redGLTFLoader['groups'][nodeIndex]['byIndex'] = nodeIndex
				checkTRSAndMATRIX(tGroup, info)
				// tGroup.matrix = matrix
				// tGroup.autoUpdateMatrix = false
				if ( 'children' in info ) {
					info['children'].forEach(function (index) {
						parseNode(redGLTFLoader, json, index, json['nodes'][index], tGroup)
					})
				}
				if ( 'skin' in info ) parseSkin(redGLTFLoader, json, info, tGroup)
			}
		}
		var parseSparse = function (redGLTFLoader, key, tAccessors, json, vertices, uvs, normals, jointWeights, joints) {
			if ( tAccessors['sparse'] ) {
				var sparseVerties = []
				var sparseNormals = []
				var sparseUvs = [];
				(function () {
					var tSparse = tAccessors['sparse']
					var tSparseValuesAccessors = tSparse['values']
					console.log('tSparseValuesAccessors', tSparseValuesAccessors)
					var tBufferView = json['bufferViews'][tSparseValuesAccessors['bufferView']]
					var tBufferIndex = tBufferView['buffer']
					var tBuffer = json['buffers'][tBufferIndex]
					var tBufferURIDataView;
					if ( tBuffer['uri'] ) {
						tBufferURIDataView = redGLTFLoader['uris']['buffers'][tBufferIndex]
					}
					var i, len;
					var tComponentType
					var tMethod;
					tComponentType = WEBGL_COMPONENT_TYPES[tAccessors['componentType']]
					if ( tComponentType == Float32Array ) tMethod = 'getFloat32'
					if ( tComponentType == Uint32Array ) tMethod = 'getUint32'
					if ( tComponentType == Uint16Array ) tMethod = 'getUint16'
					if ( tComponentType == Int16Array ) tMethod = 'getInt16'
					if ( tComponentType == Uint8Array ) tMethod = 'getUint8'
					if ( tComponentType == Int8Array ) tMethod = 'getInt8'
					var tAccessorBufferOffset = tAccessors['byteOffset'] || 0
					i = (tBufferView['byteOffset'] + tAccessorBufferOffset) / tComponentType['BYTES_PER_ELEMENT']
					switch ( tAccessors['type'] ) {
						case 'VEC3' :
							len = i + ( tComponentType['BYTES_PER_ELEMENT'] * tSparse['count']) / tComponentType['BYTES_PER_ELEMENT'] * 3
							console.log('오오오오', key, i, len)
							for ( i; i < len; i++ ) {
								if ( key == 'NORMAL' ) sparseNormals.push(tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true))
								else if ( key == 'POSITION' ) sparseVerties.push(tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true))
							}
							// console.log('인터리브 버퍼 데이터', vertices)
							break
						case 'VEC2' :
							len = i + ( tComponentType['BYTES_PER_ELEMENT'] * tSparse['count']) / tComponentType['BYTES_PER_ELEMENT'] * 2
							// console.log(i, len)
							for ( i; i < len; i++ ) {
								if ( key == 'TEXCOORD_0' ) {
									if ( i % 2 == 0 ) sparseUvs.push(tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true))
									else sparseUvs.push(-tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true))
								}
							}
							// console.log('인터리브 버퍼 데이터', vertices)
							break
						default :
							console.log('알수없는 형식 엑세서 타입', tAccessors['type'])
							break
					}
				})();
				console.log(sparseVerties)
				console.log(sparseNormals)
				console.log(sparseUvs);
				var tSparse = tAccessors['sparse']
				var tSparseAccessors = tSparse['indices']
				console.log('tSparseAccessors', tSparseAccessors)
				var tBufferView = json['bufferViews'][tSparseAccessors['bufferView']]
				var tBufferIndex = tBufferView['buffer']
				var tBuffer = json['buffers'][tBufferIndex]
				var tBufferURIDataView;
				if ( tBuffer['uri'] ) {
					tBufferURIDataView = redGLTFLoader['uris']['buffers'][tBufferIndex]
				}
				var i, len;
				var tComponentType
				var tMethod;
				tComponentType = WEBGL_COMPONENT_TYPES[tSparseAccessors['componentType']]
				if ( tComponentType == Uint16Array ) tMethod = 'getUint16'
				else if ( tComponentType == Uint8Array ) tMethod = 'getUint8'
				var tAccessorBufferOffset = tSparseAccessors['byteOffset'] || 0
				i = (tBufferView['byteOffset'] + tAccessorBufferOffset) / tComponentType['BYTES_PER_ELEMENT']
				//
				len = i + ( tComponentType['BYTES_PER_ELEMENT'] * tSparse['count']) / tComponentType['BYTES_PER_ELEMENT']
				console.log('오오오오', key, i, len)
				var sparseIndex = 0
				for ( i; i < len; i++ ) {
					var targetIndex = tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true)
					console.log('몇번째껄 부르는건가', targetIndex)
					vertices[targetIndex * 3] = sparseVerties[sparseIndex * 3]
					vertices[targetIndex * 3 + 1] = sparseVerties[sparseIndex * 3 + 1]
					vertices[targetIndex * 3 + 2] = sparseVerties[sparseIndex * 3 + 2]
					sparseIndex++
					// indices.push(tBufferURIDataView[tMethod](i * tComponentType['BYTES_PER_ELEMENT'], true))
				}
			}
		}
		var RedGLTF_AccessorInfo = function (redGLTFLoader, json, accessorIndex) {
			this['accessor'] = json['accessors'][accessorIndex];
			this['bufferView'] = json['bufferViews'][this['accessor']['bufferView']];
			this['bufferIndex'] = this['bufferView']['buffer'];
			this['buffer'] = json['buffers'][this['bufferIndex']]
			this['bufferURIDataView'] = null
			if ( this['buffer']['uri'] ) {
				this['bufferURIDataView'] = redGLTFLoader['uris']['buffers'][this['bufferIndex']]
			}
			////////////////////////////
			this['componentType'] = WEBGL_COMPONENT_TYPES[this['accessor']['componentType']]
			this['componentType_BYTES_PER_ELEMENT'] = this['componentType']['BYTES_PER_ELEMENT'];
			switch ( this['componentType'] ) {
				case Float32Array :
					this['getMethod'] = 'getFloat32'
					break
				case Uint32Array :
					this['getMethod'] = 'getUint32'
					break
				case Uint16Array :
					this['getMethod'] = 'getUint16'
					break
				case Int16Array :
					this['getMethod'] = 'getInt16'
					break
				case Uint8Array :
					this['getMethod'] = 'getUint8'
					break
				case Int8Array :
					this['getMethod'] = 'getInt8'
					break
				default :
					RedGLUtil.throwFunc('파싱할수없는 타입', this['componentType'])
			}
			this['accessorBufferOffset'] = this['accessor']['byteOffset'] || 0
			this['bufferViewByteStride'] = this['bufferView']['byteStride'] || 0
			this['startIndex'] = (this['bufferView']['byteOffset'] + this['accessorBufferOffset']) / this['componentType_BYTES_PER_ELEMENT'];
			// console.log('해당 bufferView 정보', this['bufferView'])
			// console.log('바라볼 버퍼 인덱스', this['bufferIndex'])
			// console.log('바라볼 버퍼', this['buffer'])
			// console.log('바라볼 버퍼데이터', this['bufferURIDataView'])
			// console.log('바라볼 엑세서', this['accessor'])
			// console.log('this['componentType']', this['componentType'])
			// console.log("this['getMethod']", this['getMethod'])
			// console.log("this['bufferView']['byteOffset']", this['bufferView']['byteOffset'])
			// console.log("this['accessor']['byteOffset']", this['accessor']['byteOffset'])
		}
		var parseAttributeInfo = function (redGLTFLoader, json, key, accessorInfo, vertices, uvs, normals, jointWeights, joints) {
			var tBYTES_PER_ELEMENT = accessorInfo['componentType_BYTES_PER_ELEMENT'];
			var tBufferViewByteStride = accessorInfo['bufferViewByteStride'];
			var tBufferURIDataView = accessorInfo['bufferURIDataView'];
			var tGetMethod = accessorInfo['getMethod'];
			var tType = accessorInfo['accessor']['type'];
			var tCount = accessorInfo['accessor']['count'];
			var strideIndex = 0;
			var stridePerElement = tBufferViewByteStride / tBYTES_PER_ELEMENT
			var i = accessorInfo['startIndex']
			var len
			switch ( tType ) {
				case 'VEC4' :
					if ( tBufferViewByteStride ) {
						len = i + tCount * (tBufferViewByteStride / tBYTES_PER_ELEMENT)
						for ( i; i < len; i++ ) {
							if ( strideIndex % stridePerElement < 4 ) {
								if ( key == 'WEIGHTS_0' ) jointWeights.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								else if ( key == 'JOINTS_0' ) joints.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								else RedGLUtil.throwFunc('VEC4에서 현재 지원하고 있지 않는 키', key)
							}
							strideIndex++
						}
					} else {
						len = i + tCount * 4;
						for ( i; i < len; i++ ) {
							if ( key == 'WEIGHTS_0' ) jointWeights.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							else if ( key == 'JOINTS_0' ) joints.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							// else RedGLUtil.throwFunc('VEC4에서 현재 지원하고 있지 않는 키', key)
						}
					}
					break
				case 'VEC3' :
					if ( tBufferViewByteStride ) {
						len = i + tCount * (tBufferViewByteStride / tBYTES_PER_ELEMENT)
						for ( i; i < len; i++ ) {
							if ( strideIndex % stridePerElement < 3 ) {
								if ( key == 'NORMAL' ) normals.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								else if ( key == 'POSITION' ) vertices.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								else RedGLUtil.throwFunc('VEC3에서 현재 지원하고 있지 않는 키', key)
							}
							strideIndex++
						}
					} else {
						len = i + tCount * 3;
						for ( i; i < len; i++ ) {
							if ( key == 'NORMAL' ) normals.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							else if ( key == 'POSITION' ) vertices.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							else RedGLUtil.throwFunc('VEC3에서 현재 지원하고 있지 않는 키', key)
						}
						// console.log('인터리브 버퍼 데이터', vertices)
					}
					break
				case 'VEC2' :
					if ( tBufferViewByteStride ) {
						len = i + tCount * (tBufferViewByteStride / tBYTES_PER_ELEMENT)
						for ( i; i < len; i++ ) {
							if ( strideIndex % stridePerElement < 2 ) {
								if ( key == 'TEXCOORD_0' ) {
									if ( i % 2 == 0 ) uvs.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
									else uvs.push(-tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								}
								else RedGLUtil.throwFunc('VEC2에서 현재 지원하고 있지 않는 키', key)
							}
							strideIndex++
						}
					} else {
						len = i + tCount * 2;
						for ( i; i < len; i++ ) {
							if ( key == 'TEXCOORD_0' ) {
								if ( i % 2 == 0 ) uvs.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
								else uvs.push(-tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
							} else RedGLUtil.throwFunc('VEC2에서 현재 지원하고 있지 않는 키', key)
						}
					}
					break
				default :
					console.log('알수없는 형식 엑세서 타입', tType)
					break
			}
		}
		var RedGLTF_MorphInfo = function (redGLTFLoader, json, primitiveData) {
			var morphList = []
			if ( primitiveData['targets'] ) {
				primitiveData['targets'].forEach(function (v2) {
					var tMorphData = {
						vertices: [],
						normals: [],
						uvs: [],
						jointWeights: [],
						joints: []
					}
					morphList.push(tMorphData)
					for ( var key in v2 ) {
						var vertices = tMorphData['vertices']
						var normals = tMorphData['normals']
						var uvs = tMorphData['uvs']
						var jointWeights = tMorphData['jointWeights']
						var joints = tMorphData['joints']
						var accessorIndex = v2[key]
						var accessorInfo = new RedGLTF_AccessorInfo(redGLTFLoader, json, accessorIndex)
						// 어트리뷰트 갈궈서 파악함
						parseAttributeInfo(
							redGLTFLoader, json, key, accessorInfo,
							vertices, uvs, normals, jointWeights, joints
						)
						// 스파스 정보도 갈굼
						if ( accessorInfo['accessor']['sparse'] ) parseSparse(redGLTFLoader, key, accessorInfo['accessor'], json, vertices, uvs, normals, jointWeights, joints)
					}
				})
			}
			this['list'] = morphList
			this['origin'] = null
		}
		var parseIndicesInfo = function (redGLTFLoader, json, key, accessorInfo, indices) {
			var tBYTES_PER_ELEMENT = accessorInfo['componentType_BYTES_PER_ELEMENT'];
			var tBufferURIDataView = accessorInfo['bufferURIDataView'];
			var tGetMethod = accessorInfo['getMethod'];
			var tType = accessorInfo['accessor']['type'];
			var tCount = accessorInfo['accessor']['count'];
			var i = accessorInfo['startIndex']
			var len;
			// console.log('인덱스!!', accessorInfo)
			switch ( tType ) {
				case 'SCALAR' :
					len = i + tCount
					// console.log(i, len)
					for ( i; i < len; i++ ) {
						indices.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
					}
					// console.log('인덱스버퍼 데이터', indices)
					break
				default :
					console.log('알수없는 형식 엑세서 타입', accessorInfo['accessor'])
					break
			}
		}
		var parseMaterialInfo = function (redGLTFLoader, json, v) {
			var tMaterial
			if ( 'material' in v ) {
				var tIndex = v['material']
				var tMaterialInfo = json['materials'][tIndex]
				// console.log('tMaterialInfo', tMaterialInfo)
				if ( 'baseColorTexture' in tMaterialInfo['pbrMetallicRoughness'] ) {
					var baseTextureIndex = tMaterialInfo['pbrMetallicRoughness']['baseColorTexture']['index']
					var baseTextureInfo = json['textures'][baseTextureIndex]
					var diffuseSourceIndex = baseTextureInfo['source']
					diffseTexture = RedBitmapTexture(redGLTFLoader['redGL'], redGLTFLoader['path'] + json['images'][diffuseSourceIndex]['uri'])
					// var t0 = document.createElement('img')
					// t0.src = json['images'][diffuseSourceIndex]['uri']
					// t0.style.cssText = 'position:absolute;top:0px;left:0px;width:500px'
					// document.body.appendChild(t0)
				}
				var diffseTexture, normalTexture, roughnessTexture, emissiveTexture, occlusionTexture;
				if ( 'metallicRoughnessTexture' in tMaterialInfo['pbrMetallicRoughness'] ) {
					var roughnessTextureIndex = tMaterialInfo['pbrMetallicRoughness']['metallicRoughnessTexture']['index']
					var roughnessTextureInfo = json['textures'][roughnessTextureIndex]
					var roughnessSourceIndex = roughnessTextureInfo['source']
					roughnessTexture = RedBitmapTexture(redGLTFLoader['redGL'], redGLTFLoader['path'] + json['images'][roughnessSourceIndex]['uri'])
					// var t0 = document.createElement('img')
					// t0.src = json['images'][roughnessSourceIndex]['uri']
					// t0.style.cssText = 'position:absolute;top:0px;left:0px;width:500px'
					// document.body.appendChild(t0)
				}
				var normalTextureIndex = tMaterialInfo['normalTexture']
				if ( normalTextureIndex != undefined ) {
					normalTextureIndex = normalTextureIndex['index']
					var normalTextureInfo = json['textures'][normalTextureIndex]
					var normalSourceIndex = normalTextureInfo['source']
					normalTexture = RedBitmapTexture(redGLTFLoader['redGL'], redGLTFLoader['path'] + json['images'][normalSourceIndex]['uri'])
					// var t0 = document.createElement('img')
					// t0.src = json['images'][normalSourceIndex]['uri']
					// t0.style.cssText = 'position:absolute;top:0px;left:0px;width:500px'
					// document.body.appendChild(t0)
				}
				var emissiveTextureIndex = tMaterialInfo['emissiveTexture']
				if ( emissiveTextureIndex != undefined ) {
					emissiveTextureIndex = emissiveTextureIndex['index']
					var emissiveTextureInfo = json['textures'][emissiveTextureIndex]
					var emissiveSourceIndex = emissiveTextureInfo['source']
					emissiveTexture = RedBitmapTexture(redGLTFLoader['redGL'],redGLTFLoader['path'] +  json['images'][emissiveSourceIndex]['uri'])
					// var t0 = document.createElement('img')
					// t0.src = json['images'][emissiveSourceIndex]['uri']
					// t0.style.cssText = 'position:absolute;top:0px;left:0px;width:500px'
					// document.body.appendChild(t0)
				}
				var occlusionTextureIndex = tMaterialInfo['occlusionTexture']
				if ( occlusionTextureIndex != undefined ) {
					occlusionTextureIndex = occlusionTextureIndex['index']
					var occlusionTextureInfo = json['textures'][occlusionTextureIndex]
					var occlusionSourceIndex = occlusionTextureInfo['source']
					occlusionTexture = RedBitmapTexture(redGLTFLoader['redGL'], redGLTFLoader['path'] + json['images'][occlusionSourceIndex]['uri'])
					// var t0 = document.createElement('img')
					// t0.src = json['images'][occlusionSourceIndex]['uri']
					// t0.style.cssText = 'position:absolute;top:0px;left:0px;width:500px'
					// document.body.appendChild(t0)
				}
				var metallicFactor, roughnessFactor
				if ( 'metallicFactor' in tMaterialInfo['pbrMetallicRoughness'] ) {
					metallicFactor = tMaterialInfo['pbrMetallicRoughness']['metallicFactor']
				}
				if ( 'roughnessFactor' in tMaterialInfo['pbrMetallicRoughness'] ) {
					roughnessFactor = tMaterialInfo['pbrMetallicRoughness']['roughnessFactor']
				}
				if ( diffseTexture ) {
					var env = RedBitmapCubeTexture(redGLTFLoader['redGL'], [
						'../asset/cubemap/SwedishRoyalCastle/px.jpg',
						'../asset/cubemap/SwedishRoyalCastle/nx.jpg',
						'../asset/cubemap/SwedishRoyalCastle/py.jpg',
						'../asset/cubemap/SwedishRoyalCastle/ny.jpg',
						'../asset/cubemap/SwedishRoyalCastle/pz.jpg',
						'../asset/cubemap/SwedishRoyalCastle/nz.jpg'
					])
					// Type	Description	Required
					// baseColorFactor	number [4]	The material's base color factor.	No, default: [1,1,1,1]
					// baseColorTexture	object	The base color texture.	No
					// metallicFactor	number	The metalness of the material.	No, default: 1
					// roughnessFactor	number	The roughness of the material.	No, default: 1
					// metallicRoughnessTexture	object	The metallic-roughness texture.	No
					tMaterial = RedPBRMaterial(redGLTFLoader['redGL'], diffseTexture, env, normalTexture, occlusionTexture, emissiveTexture, roughnessTexture, null)
					if ( !roughnessTexture ) tMaterial.metallicPower = metallicFactor;
				} else {
					var tColor
					if ( tMaterialInfo['pbrMetallicRoughness'] && tMaterialInfo['pbrMetallicRoughness']['baseColorFactor'] ) tColor = tMaterialInfo['pbrMetallicRoughness']['baseColorFactor']
					tColor = [(Math.random()), (Math.random()), (Math.random()), 1]
					tMaterial = RedColorPhongMaterial(redGLTFLoader['redGL'],
						RedGLUtil.rgb2hex(
							tColor[0] * 255,
							tColor[1] * 255,
							tColor[2] * 255
						),
						tColor[3]
					)
				}
			}
			return tMaterial
		}
		makeMesh = function (redGLTFLoader, json, meshData) {
			// console.log('parseMesh :')
			// console.log(meshData)
			var tName
			if ( meshData['name'] ) tName = meshData['name']
			var tMeshList = []
			meshData['primitives'].forEach(function (v, index) {
				var tMesh;
				var tMaterial
				var indices = []
				// 어트리뷰트에서 파싱되는놈들
				var vertices = []
				var uvs = []
				var normals = []
				var jointWeights = []
				var joints = []
				var tDrawMode;
				// console.log(v, index)
				// 형상 파싱
				if ( v['attributes'] ) {
					// console.log('TODO: 어트리뷰트 파싱')
					for ( var key in v['attributes'] ) {
						// console.log(k, '파싱')
						// 엑세서를 통해서 정보파악하고
						var accessorIndex = v['attributes'][key];
						var accessorInfo = new RedGLTF_AccessorInfo(redGLTFLoader, json, accessorIndex)
						// 어트리뷰트 갈궈서 파악함
						parseAttributeInfo(
							redGLTFLoader, json, key, accessorInfo,
							vertices, uvs, normals, jointWeights, joints
						)
						// 스파스 정보도 갈굼
						if ( accessorInfo['accessor']['sparse'] ) parseSparse(redGLTFLoader, key, accessorInfo['accessor'], json, vertices, uvs, normals, jointWeights, joints)
					}
				}
				// 인덱스 파싱
				if ( 'indices' in v ) {
					// console.log('TODO: 인덱스 파싱')
					// 버퍼뷰의 위치를 말하므로...이를 추적파싱항
					var accessorIndex = v['indices']
					var accessorInfo = new RedGLTF_AccessorInfo(redGLTFLoader, json, accessorIndex)
					parseIndicesInfo(
						redGLTFLoader, json, key, accessorInfo, indices
					)
				}
				// 재질파싱
				tMaterial = parseMaterialInfo(redGLTFLoader, json, v)
				// 모드 파싱
				if ( 'mode' in v ) {
					// 0 POINTS
					// 1 LINES
					// 2 LINE_LOOP
					// 3 LINE_STRIP
					// 4 TRIANGLES
					// 5 TRIANGLE_STRIP
					// 6 TRIANGLE_FAN
					// console.log('primitiveMode ', v['mode'])
					switch ( v['mode'] ) {
						case 0 :
							tDrawMode = redGLTFLoader['redGL'].gl.POINTS
							break
						case 1 :
							tDrawMode = redGLTFLoader['redGL'].gl.LINES
							break
						case 2 :
							tDrawMode = redGLTFLoader['redGL'].gl.LINE_LOOP
							break
						case 3 :
							tDrawMode = redGLTFLoader['redGL'].gl.LINE_STRIP
							break
						case 4 :
							tDrawMode = redGLTFLoader['redGL'].gl.TRIANGLES
							break
						case 5 :
							tDrawMode = redGLTFLoader['redGL'].gl.TRIANGLE_STRIP
							break
						case 6 :
							tDrawMode = redGLTFLoader['redGL'].gl.TRIANGLE_FAN
							break
					}
				}
				/////////////////////////////////////////////////////////
				// 최종데이터 생산
				var normalData
				if ( normals.length ) normalData = normals
				else normalData = RedGLUtil.calculateNormals(vertices, indices)
				// console.log('vertices', vertices)
				// console.log('normalData', normalData)
				var interleaveData = []
				var i = 0, len = vertices.length / 3
				for ( i; i < len; i++ ) {
					if ( vertices.length ) interleaveData.push(vertices[i * 3 + 0], vertices[i * 3 + 1], vertices[i * 3 + 2])
					if ( normalData.length ) interleaveData.push(normalData[i * 3 + 0], normalData[i * 3 + 1], normalData[i * 3 + 2])
					if ( uvs.length ) interleaveData.push(uvs[i * 2 + 0], uvs[i * 2 + 1])
					if ( jointWeights.length ) interleaveData.push(jointWeights[i * 4 + 0], jointWeights[i * 4 + 1], jointWeights[i * 4 + 2], jointWeights[i * 4 + 3])
					if ( joints.length ) interleaveData.push(joints[i * 4 + 0], joints[i * 4 + 1], joints[i * 4 + 2], joints[i * 4 + 3])
				}
				// console.log('interleaveData', interleaveData)
				/////////////////////////////////////////////////////////
				// 메쉬 생성
				var tGeo
				var tInterleaveInfoList = []
				if ( vertices.length ) tInterleaveInfoList.push(RedInterleaveInfo('aVertexPosition', 3))
				if ( normalData.length ) tInterleaveInfoList.push(RedInterleaveInfo('aVertexNormal', 3))
				if ( uvs.length ) tInterleaveInfoList.push(RedInterleaveInfo('aTexcoord', 2))
				if ( jointWeights.length ) tInterleaveInfoList.push(RedInterleaveInfo('aVertexWeight', 4))
				if ( joints.length ) tInterleaveInfoList.push(RedInterleaveInfo('aVertexJoint', 4))
				tGeo = RedGeometry(
					RedBuffer(
						redGLTFLoader['redGL'],
						'testGLTF_interleaveBuffer_' + RedGL.makeUUID(),
						RedBuffer.ARRAY_BUFFER,
						new Float32Array(interleaveData),
						tInterleaveInfoList
					),
					indices.length ? RedBuffer(
							redGLTFLoader['redGL'],
							'testGLTF_indexBuffer_' + RedGL.makeUUID(),
							RedBuffer.ELEMENT_ARRAY_BUFFER,
							new Uint16Array(indices)
						) : null
				)
				if ( !tMaterial ) tMaterial = RedColorPhongMaterial(redGLTFLoader['redGL'], RedGLUtil.rgb2hex(parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255)))
				// console.log('tMaterial', tMaterial)
				tMesh = RedMesh(redGLTFLoader['redGL'], tGeo, tMaterial)
				if ( tName ) tMesh.name = tName
				if ( tDrawMode ) tMesh.drawMode = tDrawMode
				else tMesh.drawMode = redGLTFLoader['redGL'].gl.TRIANGLES
				if ( meshData['doubleSided'] ) tMesh.useCullFace = false
				// console.log('tMesh', tMesh)
				/////////////////////////////////////////////////////////
				// 모프리스트 설정
				var morphInfo = new RedGLTF_MorphInfo(redGLTFLoader, json, v)
				morphInfo['list'].forEach(function (v) {
					var normalData
					if ( v['normals'].length ) normalData = v['normals']
					else normalData = RedGLUtil.calculateNormals(v['vertices'], indices)
					// console.log('vertices', vertices)
					// console.log('normalData', normalData)
					var interleaveData = []
					var i = 0, len = v['vertices'].length / 3
					for ( i; i < len; i++ ) {
						if ( v['vertices'].length ) interleaveData.push(v['vertices'][i * 3 + 0], v['vertices'][i * 3 + 1], v['vertices'][i * 3 + 2])
						if ( normalData.length ) interleaveData.push(normalData[i * 3 + 0], normalData[i * 3 + 1], normalData[i * 3 + 2])
						if ( v['uvs'].length ) interleaveData.push(v['uvs'][i * 2 + 0], v['uvs'][i * 2 + 1])
					}
					v['interleaveData'] = interleaveData
				});
				tMesh['_morphInfo'] = morphInfo
				tMesh['_morphInfo']['origin'] = new Float32Array(interleaveData)
				// console.log(morphInfo)
				tMeshList.push(tMesh)
				// console.log('vertices', vertices)
				// console.log('normalData', normalData)
				// console.log('uvs', uvs)
				// console.log('joints', joints)
				// console.log('jointWeights', jointWeights)
				// console.log('indices', indices)
			})
			return tMeshList
		}
		parseAnimations = (function () {
			var parseAnimationInfo;
			parseAnimationInfo = function (redGLTFLoader, json, accessorIndex) {
				// console.log('accessorIndex', accessorIndex)
				var dataList = []
				var accessorInfo = new RedGLTF_AccessorInfo(redGLTFLoader, json, accessorIndex)
				var tBYTES_PER_ELEMENT = accessorInfo['componentType_BYTES_PER_ELEMENT'];
				// var tBufferViewByteStride = accessorInfo['bufferViewByteStride'];
				var tBufferURIDataView = accessorInfo['bufferURIDataView'];
				var tGetMethod = accessorInfo['getMethod'];
				var tType = accessorInfo['accessor']['type'];
				var tCount = accessorInfo['accessor']['count'];
				// var strideIndex = 0;
				// var stridePerElement = tBufferViewByteStride / tBYTES_PER_ELEMENT
				var i = accessorInfo['startIndex']
				var len
				switch ( tType ) {
					case 'SCALAR' :
						len = i + tCount * 1;
						for ( i; i < len; i++ ) {
							dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
						}
						// console.log('타임 데이터', dataList)
						break
					case 'VEC4' :
						len = i + tCount * 4;
						for ( i; i < len; i++ ) {
							dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
						}
						// console.log('값 데이터', dataList)
						break
					case 'VEC3' :
						len = i + tCount * 3;
						for ( i; i < len; i++ ) {
							dataList.push(tBufferURIDataView[tGetMethod](i * tBYTES_PER_ELEMENT, true))
						}
						// console.log('값 데이터', dataList)
						break
					default :
						console.log('알수없는 형식 엑세서 타입', tAccessors)
						break
				}
				return dataList
			}
			return function (redGLTFLoader, json) {
				console.log('애니메이션 파싱시작')
				var nodes = json['nodes']
				var meshs = json['meshs']
				var accessors = json['accessors']
				if ( !json['animations'] ) json['animations'] = []
				json['animations'].forEach(function (v, index) {
					// console.log(v)
					var samplers = v['samplers'];
					//TODO: 용어를 정리해봐야겠음.
					// 이걸 애니메이션 클립으로 봐야하는가..
					var animationClip = []
					animationClip['minTime'] = 1000000;
					animationClip['maxTime'] = 0;
					animationClip['name'] = 'animation_' + index;
					// 로더에 애니메이션 데이터들을 입력함
					redGLTFLoader['animations'].push(animationClip)
					// 채널을 돌면서 파악한다.
					v['channels'].forEach(function (channel, channelIndex) {
						var tSampler;
						var tChannelTargetData;
						var tMesh;
						var tNode;
						var aniTrack; //
						tSampler = samplers[channel['sampler']];
						// console.log('tSampler', tSampler)
						tChannelTargetData = channel['target'];
						tNode = nodes[tChannelTargetData['node']];
						if ( 'mesh' in tNode ) {
							tMesh = tNode['RedMesh']
						} else {
							var tGroup
							//TODO: 이거 개선해야함
							// console.log('여기로 오는경우가 있는건가')
							if ( redGLTFLoader['groups'][tChannelTargetData['node']] ) {
								tGroup = redGLTFLoader['groups'][tChannelTargetData['node']]
								// console.log('tGroup', tGroup)
								tMesh = tGroup;
							} else {
								console.log('여기로 오는경우가 있는건가2')
								return
							}
						}
						// console.log('애니메이션 대상메쉬', tMesh)
						// console.log(tChannelTargetData['path'])
						if (
							tChannelTargetData['path'] == 'scale'
							|| tChannelTargetData['path'] == 'rotation'
							|| tChannelTargetData['path'] == 'translation'
							|| tChannelTargetData['path'] == 'weights'
						) {
							// console.log('path', tChannelTargetData['path'])
							// // 시간축은 샘플의 input
							// console.log('시간축', tSampler['input'])
							// console.log('시간엑세서 데이터', tSampler['input'])
							// console.log('시간축 데이터리스트', animationData['time'])
							// // 로테이션 축은 샘플의 output
							// console.log('translation', tSampler['output'])
							// console.log('translation 엑세서 데이터', tSampler['output'])
							// console.log('scale 데이터리스트', t0)
							animationClip.push(aniTrack = {
									key: tChannelTargetData['path'],
									time: parseAnimationInfo(redGLTFLoader, json, tSampler['input']),
									data: parseAnimationInfo(redGLTFLoader, json, tSampler['output']),
									target: tMesh
								}
							)
						} else {
							console.log('파싱할수없는 데이터', tChannelTargetData['path'])
						}
						if ( aniTrack ) {
							if ( animationClip['minTime'] > aniTrack['time'][0] ) animationClip['minTime'] = aniTrack['time'][0]
							if ( animationClip['maxTime'] < aniTrack['time'][aniTrack['time'].length - 1] ) animationClip['maxTime'] = aniTrack['time'][aniTrack['time'].length - 1]
						}
						// console.log('animationData', animationData)
					})
					if ( redGLTFLoader['animations'].length ) {
						redGLTFLoader.playAnimation(redGLTFLoader['animations'][0])
					}
				})
			}
		})();
		return function (redGLTFLoader, redGL, json, callBack) {
			console.log('파싱시작', redGLTFLoader['path'] + redGLTFLoader['fileName']);
			// console.log('rawData', json);
			checkAsset(json);
			getBaseResource(redGLTFLoader, json,
				function () {
					// 리소스 로딩이 완료되면 다음 진행
					parseScene(redGLTFLoader, json)
					parseAnimations(redGLTFLoader, json)
					if ( callBack ) callBack();
				}
			)
			return {
				fileName: redGLTFLoader['fileName'],
				path: redGLTFLoader['path'],
				resultMesh: redGLTFLoader['resultMesh'],
				redGLTFLoader: redGLTFLoader
			}
		}
	})();
	Object.freeze(RedGLTFLoader);
})();