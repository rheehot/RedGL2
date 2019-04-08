"use strict";
var RedGeometry;
(function () {
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedGeometry`,
		 description : `
		     인터리브 버퍼와 인덱스 버퍼로 구성된 정보 구조체.
			 RedGeometry Instance 생성자.
		 `,
		 params : {
			 interleaveBuffer : [
				 {type:'RedBuffer'},
				 `필수`
			 ],
			 indexBuffer : [
				 {type:'RedBuffer'},
				 `필수아님`
			 ]
		 },
		 demo : '../example/RedBuffer.html',
		 example : `
			 RedGeometry(interleaveBuffer,indexBuffer)
		 `,
		 return : 'RedGeometry Instance'
	 }
     :DOC*/
    RedGeometry = function (interleaveBuffer, indexBuffer) {
        if (!(this instanceof RedGeometry)) return new RedGeometry(interleaveBuffer, indexBuffer);
        interleaveBuffer instanceof RedBuffer || RedGLUtil.throwFunc('RedGeometry : interleaveBuffer - RedBuffer Instance만 허용.', interleaveBuffer);
        interleaveBuffer['bufferType'] == RedBuffer.ARRAY_BUFFER || RedGLUtil.throwFunc('RedGeometry : interleaveBuffer - RedBuffer.ARRAY_BUFFER 타입만 허용.', interleaveBuffer);
        if (indexBuffer) {
            interleaveBuffer || RedGLUtil.throwFunc('RedGeometry : indexBuffer는 반드시 interleaveBuffer와 쌍으로 입력되어야함.', indexBuffer);
            indexBuffer instanceof RedBuffer || RedGLUtil.throwFunc('RedGeometry : indexBuffer - RedBuffer Instance만 허용.', indexBuffer);
            indexBuffer['bufferType'] == RedBuffer.ELEMENT_ARRAY_BUFFER || RedGLUtil.throwFunc('RedGeometry : indexBuffer - RedBuffer.ELEMENT_ARRAY_BUFFER 타입만 허용.', indexBuffer);
        }
        /**DOC:
         {
		     code : 'PROPERTY',
			 title :`interleaveBuffer`,
			 description : `interleaveBuffer`,
			 return : 'RedBuffer Instance'
		 }
         :DOC*/
        this['interleaveBuffer'] = interleaveBuffer;
        /**DOC:
         {
		     code : 'PROPERTY',
			 title :`indexBuffer`,
			 description : `indexBuffer`,
			 return : 'RedBuffer Instance'
		 }
         :DOC*/
        this['indexBuffer'] = indexBuffer;
        this['_volume'] = null;
        this['_UUID'] = RedGL.makeUUID();
        // console.log(this);
    };
    RedGeometry.prototype = {
        /**DOC:
         {
		     code : 'METHOD',
			 title :`disposeAllBuffer`,
			 description : `내부 interleaveBuffer, indexBuffer 둘다 dispose`,
			 return : 'void'
		 }
         :DOC*/
        disposeAllBuffer: (function () {
            var k;
            return function () {
                for (k in this) {
                    if (this && this[k] instanceof RedBuffer) this[k].dispose()
                }
            }
        })(),
        /**DOC:
         {
		     code : 'METHOD',
			 title :`disposeBuffer`,
			 description : `입력된키( interleaveBuffer or indexBuffer )에 해당하는 버퍼 dispose`,
			 return : 'void'
		 }
         :DOC*/
        disposeBuffer: function (key) {
            if (this && this[key] instanceof RedBuffer) this[key].dispose()
        }
    };
    /**DOC:
     {
		     code : 'METHOD',
			 title :`volume`,
			 description : `지오메트리 고유의 볼륨을 리턴함`,
			 return : 'array : [xVolume, yVolume, zVolume]'
		 }
     :DOC*/
    Object.defineProperty(RedGeometry.prototype, 'volume', {
        get: function () {
            var minX, minY, minZ, maxX, maxY, maxZ, t0, t1, t2, t, i;
            var stride = this['interleaveBuffer']['stride']
            // if (!volume[this]) {
            minX = minY = minZ = maxX = maxY = maxZ = 0,
                t = this['interleaveBuffer']['data'], i = 0, len = this['interleaveBuffer']['pointNum']
            for (i; i < len; i++) {
                t0 = i * stride , t1 = t0 + 1, t2 = t0 + 2,
                    minX = t[t0] < minX ? t[t0] : minX,
                    maxX = t[t0] > maxX ? t[t0] : maxX,
                    minY = t[t1] < minY ? t[t1] : minY,
                    maxY = t[t1] > maxY ? t[t1] : maxY,
                    minZ = t[t2] < minZ ? t[t2] : minZ,
                    maxZ = t[t2] > maxZ ? t[t2] : maxZ;

            }
            this['_volume'] = [maxX - minX, maxY - minY, maxZ - minZ];
            // }
            return this['_volume'];
        }
    })

    Object.freeze(RedGeometry);
})();