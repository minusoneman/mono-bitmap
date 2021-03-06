"use strict";

const PlanarStorageCanvas = require("./PlanarStorageCanvas");

module.exports = class PlanarRGBCanvas extends PlanarStorageCanvas {

    /**
     * A canvas that stores RGB values. The values for pixels are stored separated by plane, i.e.
     * R-R-R-G-G-G-B-B-B for RGB.
     *
     * The pixel value must be an array with three elements containing R, G and B values of that pixel.
     *
     * @class
     * @param {number} width
     * @param {number} height
     * @param {number} bytesPerPixel Possible values: <code>1</code>, <code>2</code>,
     *                                    <code>4</code>
     * @param {Endianness} endianness Use big- or little-endian when storing multiple bytes per
     *                                      pixel
     */
    constructor(width, height, bytesPerPixel, endianness) {
        super(width, height, 3, bytesPerPixel, endianness);
    }
};
