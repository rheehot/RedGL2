"use strict";
/**DOC:
 {
	 constructorYn : true,
	 title :`RedXR`,
	 description : `
		 <h1>연구시작전</h1>
	 `
 }
 :DOC*/
let RedXR;
(function () {
    RedXR = function (canvas, callback, frameUpdater) {
        (_ => {
            'use strict';
            const polyfill = new WebXRPolyfill();
            var versionShim = new WebXRVersionShim();
            const cvs = document.createElement('canvas');
            // cvs.width = '600'
            // cvs.height = '300'
            // cvs.style.cssText = 'position:absolute;top:0;left:0;';
            canvas.style.display = 'none'
            // document.body.appendChild(cvs)
            const xrButton = new XRDeviceButton({
                onRequestSession: device => device.requestSession({
                    immersive: true
                    // outputContext: cvs.getContext('xrpresent')
                }).then(session => {
                    console.log('session', session)
                    xrButton.setSession(session);
                    session.addEventListener('end', e => {
                        xrButton.setSession(null)
                        canvas.style.display = 'none'
                    });
                    start(session);
                }),
                onEndSession: session => session.end()
            });
            [canvas, xrButton.domElement].forEach(el => document.body.appendChild(el));
            if (navigator.xr) {
                navigator.xr.requestDevice().then(device => device.supportsSession({immersive: true}).then(_ => xrButton.setDevice(device)));
            }
            const start = session => {
                const start = isOK => {
                    console.log('session', session)
                    if (!isOK) return console.log('error');
                    canvas.style.display = 'block'
                    const camL = RedCamera()
                    const camR = RedCamera()
                    const renderer = RedRenderer(redGL)
                    const world = RedWorld()
                    const scene = RedScene(redGL);
                    redGL.world = world
                    renderer.world = redGL.world;
                    camL.autoUpdateMatrix = camR.autoUpdateMatrix = false;
                    const tUUID = +RedGL.makeUUID()
                    const tLeftViewName = 'left' + tUUID
                    const tRightViewName = 'right' + tUUID
                    world.addView(RedView(tLeftViewName, redGL, scene, camL));
                    RedView(tLeftViewName).setSize('50%', '100%');
                    RedView(tLeftViewName).setLocation('0%', '0%');
                    world.addView(RedView('right' + tUUID, redGL, scene, camR));
                    RedView(tRightViewName).setSize('50%', '100%');
                    RedView(tRightViewName).setLocation('50%', '0%');
                    const resultObject = {
                        world: world,
                        scene: scene
                    }
                    Object.freeze(resultObject)
                    if (callback) callback.call(redGL, resultObject)
                    session.baseLayer = new XRWebGLLayer(session, redGL.gl);
                    redGL.gl.bindFramebuffer(redGL.gl.FRAMEBUFFER, session.baseLayer.framebuffer);
                    session.requestFrameOfReference('eye-level').then(frameOfRef => {
                        const onframe = (t, frame) => {
                            const session = frame.session;
                            const pose = frame.getDevicePose(frameOfRef);
                            if (pose) {
                                redGL.gl.clear(redGL.gl.COLOR_BUFFER_BIT | redGL.gl.DEPTH_BUFFER_BIT);
                                for (const view of frame.views) {
                                    const viewport = session.baseLayer.getViewport(view);
                                    const cam = viewport.x == 0 ? camL : camR;
                                    const viewName = viewport.x == 0 ? tLeftViewName : tRightViewName

                                    RedView(viewName).setSize(viewport.width, viewport.height)
                                    RedView(viewName).setLocation(viewport.x, viewport.y)
                                    cam.perspectiveMTX = view.projectionMatrix;
                                    cam.matrix = pose.getViewMatrix(view);
                                }
                                frameUpdater(t)
                                renderer.render(redGL, t);
                            }
                            session.requestAnimationFrame(onframe);
                        }
                        redGL.setSize('100%', '100%', true)
                        session.requestAnimationFrame(onframe);
                    });
                };
                const redGL = RedGL(canvas, start, {compatibleXRDevice: session.device});
            };
        })();
    }
    RedXR['makeUUID'] = (function () {
        let UUID = 0;
        return function () {
            return UUID++
        }
    })();
    RedXR.prototype = {};
    Object.freeze(RedGL);
})();
