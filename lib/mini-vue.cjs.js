'use strict';

function createVNode(type, props, children) { }

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
        },
    };
}

function h(type, props, children) {
    return createVNode();
}

exports.createApp = createApp;
exports.h = h;
