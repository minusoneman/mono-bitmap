"use strict";

const MultiValueStorageCanvas = require("./MultiValueStorageCanvas");

/**
 * A canvas that stores values with a fixed number of components (e.g. greyscale, RGB). The values for a single pixel are stored consecutively, i.e.
 * R-G-B-R-G-B-... for RGB.
 *
 * The pixel value must be an array with the exact number of elements of that pixel.
 */
module.exports = class InterleavedStorageCanvas extends MultiValueStorageCanvas {

    _offset(x, y, component) {
        return (y * this._width + x) * this._bytesPerPixel * this._valuesPerPixel + component * this._bytesPerPixel;
    }
};
