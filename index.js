"use strict";

/**
 * @module bitmap_manipulation
 */
exports.Endianness = require("./lib/Endianness");
exports.Bitmap = require("./lib/Bitmap");
exports.BMPBitmap = require("./lib/BMPBitmap");
exports.Font = require("./lib/Font");
exports.canvas = {
    Base: require("./lib/canvas/Canvas"),
    Grayscale: require("./lib/canvas/GrayscaleCanvas"),
    Interleaved: require("./lib/canvas/InterleavedStorageCanvas"),
    Planar: require("./lib/canvas/PlanarStorageCanvas"),
    RGB: require("./lib/canvas/RGBCanvas"),
    PlanarRGB: require("./lib/canvas/PlanarRGBCanvas")
};
