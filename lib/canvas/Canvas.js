"use strict";

const Endianness = require("../Endianness");

module.exports = class Canvas {
    constructor(width, height, bytesPerPixel, endianness) {
        this._width = width;
        this._height = height;
        this._bytesPerPixel = bytesPerPixel;
        this._endianness = endianness || Endianness.BIG;
        this._data = null;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    areCoordinatesValid(x, y) {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    }

    getPixel(/*x, y*/) {
        throw "Not implemented";
    }

    setPixel(/*x, y, value*/) {
        throw "Not implemented";
    }

    get data() {
        return this._data;
    }

    _readFunction() {
        switch (this._bytesPerPixel) {
            case 1:
                return Buffer.prototype.readUInt8;
            case 2:
                return this._endianness === Endianness.BIG ? Buffer.prototype.readUInt16BE : Buffer.prototype.readUInt16LE;
            case 4:
                return this._endianness === Endianness.BIG ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE;
        }
        return null;
    }

    _writeFunction() {
        switch (this._bytesPerPixel) {
            case 1:
                return Buffer.prototype.writeUInt8;
            case 2:
                return this._endianness === Endianness.BIG ? Buffer.prototype.writeUInt16BE : Buffer.prototype.writeUInt16LE;
            case 4:
                return this._endianness === Endianness.BIG ? Buffer.prototype.writeUInt32BE : Buffer.prototype.writeUInt32LE;
        }
        return null;
    }
};
