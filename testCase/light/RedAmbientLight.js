"use strict";
RedGL( document.createElement( 'canvas' ), function ( v ) {
	var tRedGL = this;
	redSuite(
		"RedAmbientLight Test",
		redGroup(
			"생성 확인",
			redTest( "기본 생성 테스트", function ( unit, title ) {
				try {
					var t0 = RedAmbientLight( tRedGL );
					console.log( t0 )
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "type확인", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL );
				unit.run( t0['type'] )
			}, RedAmbientLight['type'] ),
			redTest( "type확인은 불변", function ( unit, title ) {
				try {
					var t0 = RedAmbientLight( tRedGL );
					t0['type'] = 1
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		),
		redGroup(
			"인자테스트 - redGL",
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : redGL - RedGL instance만 허용.", function ( unit, title ) {
				try {
					RedAmbientLight( 1 );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false )
		),
		redGroup(
			"인자테스트 - hexColor",
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : hexColor - #xxxxxx or #xxx 만 허용 - 1", function ( unit, title ) {
				try {
					RedAmbientLight( tRedGL, 1 );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "인자테스트 ( redGL, hexColor, alpha ) : hexColor - #xxxxxx or #xxx 만 허용 - '#2233'", function ( unit, title ) {
				try {
					RedAmbientLight( tRedGL, '#2233' );
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #556677", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#556677' );
				unit.run( t0['color'] )
			}, '#556677' ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #fff", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#fff' );
				unit.run( t0['color'] )
			}, '#fff' ),
			redTest( "생성인자 반영되는지 체크 : hexColor - #fff", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#fff' );
				unit.run( t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2] )
			}, '1_1_1' )
		),
		redGroup(
			"인자테스트 - alpha",
			redTest( "생성인자 반영되는지 체크 : alpha - 0.5", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#556677', 0.5 );
				unit.run( t0['alpha'] )
			}, 0.5 ),
			redTest( "생성인자 반영되는지 체크 : alpha - 0.5", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#556677', 0.5 );
				unit.run( t0['_color'][3] )
			}, 0.5 ),
			redTest( "생성인자 반영되는지 체크 : hexColor & alpha", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#fff', 0.5 );
				unit.run( t0['_color'][0] + '_' + t0['_color'][1] + '_' + t0['_color'][2] + '_' + t0['_color'][3] )
			}, '1_1_1_0.5' ),
			redTest( "생성인자 반영되는지 체크 : 숫자만 허용하는지", function ( unit, title ) {
				try {
					RedAmbientLight( tRedGL, '#fff', 'test' );
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "생성인자 반영되는지 체크 : 1이상을 입력하면 1로 치환되는지", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#fff', 1111 );
				unit.run( t0['alpha'] )
			}, 1 ),
			redTest( "생성인자 반영되는지 체크 : 0이하를 입력하면 0으로 치환되는지", function ( unit, title ) {
				var t0 = RedAmbientLight( tRedGL, '#fff', -12345 );
				unit.run( t0['alpha'] )
			}, 0 )
		),
		redGroup(
			"intensity",
			redTest( "숫자만 허용하는지", function ( unit, title ) {
				try {
					var t0 = RedAmbientLight( tRedGL );
					t0['intensity'] = 'test'
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, false ),
			redTest( "숫자만 허용하는지", function ( unit, title ) {
				try {
					var t0 = RedAmbientLight( tRedGL );
					t0['intensity'] = 1
					unit.run( true )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, true ),
			redTest( "0이하를 입력하면 0으로 치환되는지", function ( unit, title ) {
				try {
					var t0 = RedAmbientLight( tRedGL );
					t0['intensity'] = -1
					unit.run( t0['intensity'] )
				} catch ( error ) {
					console.log( '///////////////////////////////////////////////////////////' )
					console.log( title, '\n', error )
					unit.run( false )
				}
			}, 0 )
		)
	)
} )