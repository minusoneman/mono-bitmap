"use strict";

const MultiValueStorageCanvas = require("./MultiValueStorageCanvas");

/**
 * A canvas that stores values with a fixed number of components (e.g. greyscale, RGB). The values for pixels are stored separated by plane, i.e.
 * R-R-R-G-G-G-B-B-B for RGB.
 *
 * The pixel value must be an array with the exact number of elements of that pixel.
 */
module.exports = class PlanerStorageCanvas extends MultiValueStorageCanvas {

    _offset(x, y, component) {
        return component * this._width * this._height * this._bytesPerPixel +
            (y * this._width + x) * this._bytesPerPixel;
    }
};
