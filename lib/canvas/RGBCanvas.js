"use strict";

const ConsecutiveStorageCanvas = require("./InterleavedStorageCanvas");

module.exports = class RGBCanvas extends ConsecutiveStorageCanvas {

    /**
     * A canvas that stores RGB values. The values for a single pixel are stored consecutively, i.e.
     * R-G-B-R-G-B-...
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
