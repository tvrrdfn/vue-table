"use strict";

import MouseHandler from './mouse-handler';
import utils from './event.utils';


function ResizeHandler(instance, options) {
    this.instance = instance;
    this.options = options;
}
ResizeHandler.prototype = new MouseHandler();
ResizeHandler.prototype.constructor = ResizeHandler;

// helper functions
function eventPageX(event) {
    var pageX = event.pageX;

    if (typeof pageX == 'undefined') {
        var body = document.body;
        var docElem = document.documentElement;
        pageX = event.clientX + (docElem && docElem.scrollLeft || body && body.scrollLeft || 0) - (docElem && docElem.clientLeft || body && body.clientLeft || 0);
    }

    return pageX;
}

// private functions
ResizeHandler.prototype._mousePrepareDrag = function(event) {
    this.cur = document.body.style.cursor;
    document.body.style.cursor = 'col-resize';

    return true;
};
ResizeHandler.prototype._mouseStartDrag = function(event) {
    this.instance.dragstart(event);
}
ResizeHandler.prototype._mouseDrag = function(event) {
    var dist = eventPageX(event) - eventPageX(this._mouseDownEvent);
    let currWidth = this.dragWidth + dist;
    let nextWidth = this.nextWidth - dist;

    if(currWidth >= this.options.minWidth && nextWidth >= this.options.minWidth){
        this.instance.dragging(event, currWidth, nextWidth);
    }
}
ResizeHandler.prototype._mouseStopDrag = function() {
    document.body.style.cursor = this.cur;
    this.instance.dragend();
};

/**
 * @param {Number} index
 * @param {Number} nextIndex
 */
ResizeHandler.prototype._init = function(event, dragWidth, nextWidth) {
    this.dragWidth = dragWidth;
    this.nextWidth = nextWidth;
    this._mouseDown(event);
}

export default ResizeHandler;