"use strict";
RedGL.setDoNotPrepareProgram();
RedGL(document.createElement('canvas'), function (v) {
    var tRedGL = this;
    redSuite(
        "RedColorMaterial 테스트",
        redGroup(
            "RedColorMaterial( redGL, hexColor, alpha )",
            redTest("성공테스트 : 기본 생성 테스트", function (unit, title) {
                try {
                    RedColorMaterial(tRedGL);
                    unit.run(true)
                } catch (error) {
                    console.log('///////////////////////////////////////////////////////////')
                    console.log(title, '\n', error)
                    unit.run(false)
                }
            }, true),
            redTest("실패테스트 : RedGL instance만 허용.", function (unit, title) {
                try {
                    RedColorMaterial(1);
                    unit.run(true)
                } catch (error) {
                    console.log('///////////////////////////////////////////////////////////')
                    console.log(title, '\n', error)
                    unit.run(false)
                }
            }, false)
        ),
        redGroup(
            "RedColorMaterial( redGL, <b>hexColor</b>, alpha )",
            redTest("성공테스트 :  미입력시 초기값이 hex형태로 입력되어있는지", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL);
                unit.run(RedGLUtil.regHex(t0.color))
            }, true),
            redTest("실패테스트 : #xxxxxx or #xxx 만 허용 - 숫자입력시", function (unit, title) {
                try {
                    RedColorMaterial(tRedGL, 1);
                    unit.run(true)
                } catch (error) {
                    console.log('///////////////////////////////////////////////////////////')
                    console.log(title, '\n', error)
                    unit.run(false)
                }
            }, false),
            redTest("실패테스트 : hexColor - #xxxxxx or #xxx 만 허용 - '#2233'", function (unit, title) {
                try {
                    RedColorMaterial(tRedGL, '#2233');
                    unit.run(true)
                } catch (error) {
                    console.log('///////////////////////////////////////////////////////////')
                    console.log(title, '\n', error)
                    unit.run(false)
                }
            }, false),
            redTest("성공테스트 : #556677", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#556677');
                unit.run(t0['color'])
            }, '#556677'),
            redTest("성공테스트 : #fff", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#fff');
                unit.run(t0['color'])
            }, '#fff'),
            redTest("성공테스트 : zeroToOne rgb 컬러로 변환되어 반영되는지 확인", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#00ff00');
                unit.run(t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2])
            }, '0_1_0')
        ),
        redGroup(
            "RedColorMaterial( redGL, hexColor, <b>alpha</b> )",
            redTest("성공테스트 : 0.5", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#556677', 0.5);
                unit.run(t0['alpha'])
            }, 0.5),
            redTest("성공테스트 : 0.5", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#556677', 0.5);
                unit.run(t0['_color'][3])
            }, 0.5),
            redTest("성공테스트 : hexColor & alpha", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#fff', 0.5);
                unit.run(t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2] + '_' + t0['_color'][3])
            }, '1_1_1_0.5'),
            redTest("실패테스트  : 생성인자 반영되는지 체크 : 숫자만 허용하는지", function (unit, title) {
                try {
                    RedColorMaterial(tRedGL, '#fff', 'test');
                } catch (error) {
                    console.log('///////////////////////////////////////////////////////////')
                    console.log(title, '\n', error)
                    unit.run(false)
                }
            }, false),
            redTest("성공테스트 : 1이상을 입력하면 1로 치환되는지", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#fff', 1111);
                unit.run(t0['alpha'])
            }, 1),
            redTest("성공테스트 : 0이하를 입력하면 0으로 치환되는지", function (unit, title) {
                var t0 = RedColorMaterial(tRedGL, '#fff', -12345);
                unit.run(t0['alpha'])
            }, 0)
        )
    )
})
