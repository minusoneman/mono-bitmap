"use strict";

const GrayscaleCanvas = require("./canvas/GrayscaleCanvas");

module.exports = class ColorDepthChanger {
    constructor(oldBytesPerPixel, newBytesPerPixel, endianness) {
        this._oldBytesPerPixel = oldBytesPerPixel;
        this._newBytesPerPixel = newBytesPerPixel;
        this._endianness = endianness;
    }

    change(canvas, palette) {
        let newCanvas = new GrayscaleCanvas(canvas.width, canvas.height, this._newBytesPerPixel, this._endianness);
        let newPalette = [];

        for (let x = 0; x < canvas.width; ++x) {
            for (let y = 0; y < canvas.height; ++y) {
                let pixel = canvas.getPixel(x, y);
                let oldPixelColor = ColorDepthChanger._convertPixelToColor(pixel, this._oldBytesPerPixel, palette);
                let newPixelColor = ColorDepthChanger._convertColorToPixel(oldPixelColor, this._newBytesPerPixel, newPalette);
                newCanvas.setPixel(x, y, newPixelColor);
            }
        }

        return {newCanvas: newCanvas, newPalette: newPalette};
    }

    static _convertPixelToColor(pixel, bytesPerPixel, palette) {
        switch (bytesPerPixel) {
            case 1:
                return palette[pixel] || 0;
            case 2:
                return (
                    Math.round((pixel >> 5 >> 6) / 0b11111 * 0xff) << 16 |
                    Math.round((pixel >> 5 & 0b111111) / 0b111111 * 0xff) << 8 |
                    Math.round((pixel & 0b11111) / 0b11111 * 0xff)
                );
            case 4:
                return pixel;
        }
        return 0;
    }

    static _convertColorToPixel(color, bytesPerPixel, palette) {
        switch (bytesPerPixel) {
            case 1: {
                let colorIndex = palette.indexOf(color);
                if (colorIndex === -1) {
                    if (palette.length < 0xff) {
                        colorIndex = palette.length;
                        this._palette[colorIndex] = color;
                    } else {
                        colorIndex = 0;
                    }
                }

                return colorIndex;
            }
            case 2:
                return Math.round((color >> 16 & 0xff) / 0xff * 0b11111) << 6 << 5 |
                    Math.round((color >> 8 & 0xff) / 0xff * 0b111111) << 5 |
                    Math.round((color & 0xff) / 0xff * 0b11111);
            case 4:
                return color;
        }
        return 0;
    }
};
