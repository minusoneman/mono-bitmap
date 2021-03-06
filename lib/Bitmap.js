"use strict";

const Endianness = require("./Endianness");
const Canvas = require("./canvas/Canvas");
const GrayscaleCanvas = require("./canvas/GrayscaleCanvas");

function calculateGradientValue(step, numSteps, leftColor, rightColor) {
    if (step === 0) {
        return leftColor;
    }
    if (step === numSteps - 1) {
        return rightColor;
    }
    var changePerStep = (rightColor - leftColor + .5) / numSteps;
    return Math.round(step * changePerStep) + leftColor;
}

/**
 * Creates an in-memory bitmap.
 *
 * Bitmap can either be constructed from a Canvas implementation or with some image parameters, which causes
 * the bitmap to use a GrayscaleCanvas. The latter way is deprecated!
 *
 * TODO: Express this in JSDoc.
 *
 * @class
 * @param {number} width
 * @param {number} height
 * @param {number} [bytesPerPixel=1] Possible values: <code>1</code>, <code>2</code>,
 *                                    <code>4</code>
 * @param {Endianness} [endianness=BIG] Use big- or little-endian when storing multiple bytes per
 *                                      pixel
 */
module.exports = class Bitmap {
    constructor(widthOrCanvas, height, bytesPerPixel, endianness) {
        if (widthOrCanvas instanceof Canvas) {
            this._canvas = widthOrCanvas;
        } else {
            // Validate bytes per pixel
            if (bytesPerPixel === undefined) {
                bytesPerPixel = 1;
            }
            if (bytesPerPixel !== 1 && bytesPerPixel !== 2 && bytesPerPixel !== 4) {
                throw new Error(`Invalid number of bytes per pixel: ${bytesPerPixel}`);
            }
            endianness = endianness || Endianness.BIG;

            this._canvas = new GrayscaleCanvas(widthOrCanvas, height, bytesPerPixel, endianness);
        }

        // Initialize to black
        // TODO: "Black" must be defined by the canvas
        this.clear();
    }

    /**
     * @return {number} width of the bitmap in pixels
     */
    get width() {
        return this._canvas.width;
    }

    /**
     * @method module:bitmap_manipulation.Bitmap#getWidth
     * @returns {number}
     * @deprecated use property width instead
     */
    getWidth() {
        return this.width;
    }

    /**
     * @return {number} height of the bitmap in pixels
     */
    get height() {
        return this._canvas.height;
    }

    /**
     * @method module:bitmap_manipulation.Bitmap#getHeight
     * @returns {number}
     * @deprecated use property height instead
     */
    getHeight() {
        return this.height;
    }

    /**
     * @method module:bitmap_manipulation.Bitmap#data
     * @returns {Buffer} The byte data of this bitmap
     */
    data() {
        return this._canvas.data;
    }

    /**
     * Sets all pixels to the specified value.
     *
     * @method module:bitmap_manipulation.Bitmap#clear
     * @param {number} [color=0]
     */
    clear(color) {
        color = color || 0;
        for (let x = 0; x < this.getWidth(); ++x) {
            for (let y = 0; y < this.getHeight(); ++y) {
                this.setPixel(x, y, color);
            }
        }
    }

    /**
     * @method module:bitmap_manipulation.Bitmap#getPixel
     * @param {number} x X-coordinate
     * @param {number} y Y-coordinate
     * @returns {number} The pixel color or <code>null</code> when the coordinates are out of the
     *                    bitmap surface
     */
    getPixel(x, y) {
        return this._canvas.getPixel(x, y);
    }

    /**
     * Sets the pixel at the given coordinates.
     *
     * @method module:bitmap_manipulation.Bitmap#setPixel
     * @param {number} x X-coordinate
     * @param {number} y Y-coordinate
     * @param {number} color The raw pixel value according to the bytes per pixel
     */
    setPixel(x, y, color) {
        return this._canvas.setPixel(x, y, color);
    }

    /**
     * Sets the color of every pixel in a specific color to a new color.
     *
     * @method module:bitmap_manipulation.Bitmap#replaceColor
     * @param {number} color The current color to get rid of
     * @param {number} newColor The new color to use for the identified pixels
     */
    replaceColor(color, newColor) {
        for (let x = 0; x < this.getWidth(); ++x) {
            for (let y = 0; y < this.getHeight(); ++y) {
                if (this.getPixel(x, y) === color) {
                    this.setPixel(x, y, newColor);
                }
            }
        }
    }

    /**
     * Draws a rectangle, optionally filled, optionally with a border.
     *
     * @method module:bitmap_manipulation.Bitmap#drawRectangle
     * @param {number} left Starting x coordinate
     * @param {number} top Starting y coordinate
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {?number} borderColor Color of the border. Pass <code>null</code> to indicate
     *                        no border
     * @param {?number} fillColor Color to fill the rectangle with. Pass <code>null</code> to indicate
     *                        no filling
     * @param {number} [borderWidth=1]
     */
    drawFilledRect(left, top, width, height, borderColor, fillColor, borderWidth) {
        if (borderWidth === undefined) {
            borderWidth = 1;
        }
        let x, y, right, bottom;
        // Draw border
        if (borderColor !== null) {
            // Draw left and right border (without the parts that intersect with the horizontal
            // borders)
            bottom = top + height - borderWidth;
            for (y = top + borderWidth; y < bottom; y++) {
                right = Math.min(left + borderWidth, left + width);
                for (x = left; x < right; x++) {
                    this.setPixel(x, y, borderColor);
                }
                right = left + width;
                for (x = Math.max(left + width - borderWidth, left); x < right; x++) {
                    this.setPixel(x, y, borderColor);
                }
            }
            // Draw top and bottom border
            right = left + width;
            for (x = left; x < right; x++) {
                bottom = Math.min(top + borderWidth, top + height);
                for (y = top; y < bottom; y++) {
                    this.setPixel(x, y, borderColor);
                }
                bottom = top + height;
                for (y = Math.max(top + height - borderWidth, top); y < bottom; y++) {
                    this.setPixel(x, y, borderColor);
                }
            }
            left += borderWidth;
            //noinspection JSSuspiciousNameCombination
            top += borderWidth;
            width = Math.max(width - borderWidth * 2, 0);
            height = Math.max(height - borderWidth * 2, 0);
        }
        // Draw filled area
        if (fillColor !== null) {
            right = left + width;
            bottom = top + height;
            for (y = top; y < bottom; y++) {
                for (x = left; x < right; x++) {
                    this.setPixel(x, y, fillColor);
                }
            }
        }
    }

    /**
     * Draws a rectangle that's filled with a horizontal gradient.
     *
     * @method module:bitmap_manipulation.Bitmap#drawGradientRectangle
     * @param {number} left Starting x coordinate
     * @param {number} top Starting y coordinate
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} leftColor Greyscale color of the leftmost pixel
     * @param {number} rightColor Greyscale color of the rightmost pixel
     */
    drawGradientRect(left, top, width, height, leftColor, rightColor) {
        for (let x = left; x < left + width; ++x) {
            var value = calculateGradientValue(x - left, width, leftColor, rightColor);
            for (let y = top; y < top + height; ++y) {
                this.setPixel(x, y, value);
            }
        }
    }


    /**
     * Draws a circle or ellipse.
     *
     * <em>Note:</em> Drawing borders lacks quality. Consider drawing a filled shape on top of
     * another.
     *
     * @method module:bitmap_manipulation.Bitmap#drawEllipse
     * @param {number} left
     * @param {number} top
     * @param {number} width
     * @param {number} height
     * @param {?number} borderColor Color of the border. Pass <code>null</code> for transparency
     * @param {?number} fillColor Color of the filling. Pass <code>null</code> for transparency
     * @param {number} [borderWidth=1]
     */
    drawEllipse(left, top, width, height, borderColor, fillColor, borderWidth) {
        borderWidth = borderColor !== undefined && borderColor !== null ?
            (borderWidth ? borderWidth : 1) : 0;

        let hasSolidFilling = fillColor !== null;
        let centerX = width / 2;
        let centerY = height / 2;
        let circleFactorY = width / height; // Used to convert the ellipse to a circle for an easier algorithm
        let circleRadiusSquared = Math.pow(width / 2, 2);
        let right = left + width;
        let bottom = top + height;
        for (let y = top; y < bottom; y++) {
            let circleYSquared = Math.pow((y - top - centerY + 0.5) * circleFactorY, 2);
            let intermediateY = y - top - centerY;
            let innerCircleYSquared = Math.pow(
                (intermediateY + Math.sign(intermediateY) * borderWidth + 0.5) * circleFactorY,
                2);
            for (let x = left; x < right; x++) {
                let currentCircleRadiusSquared = Math.pow(x - left - centerX + 0.5, 2) +
                    circleYSquared;
                if (currentCircleRadiusSquared <= circleRadiusSquared) {
                    let intermediateX = x - left - centerX;
                    currentCircleRadiusSquared = Math.pow(
                            intermediateX + Math.sign(intermediateX) * borderWidth + 0.5, 2) +
                        innerCircleYSquared;
                    if (currentCircleRadiusSquared <= circleRadiusSquared) {
                        if (hasSolidFilling) {
                            this.setPixel(x, y, fillColor);
                        }
                    } else {
                        this.setPixel(x, y, borderColor);
                    }
                }
            }
        }
    }

    /**
     * Inverts the image by negating every data bit.
     *
     * @method module:bitmap_manipulation.Bitmap#invert
     */
    invert() {
        for (let i = 0; i < this._data.length; i++) {
            this._data[i] = ~this._data[i];
        }
    }

    /**
     * Draws another bitmap or a portion of it on this bitmap. You can specify a color from the
     * source bitmap to be handled as transparent.
     *
     * @method module:bitmap_manipulation.Bitmap#drawBitmap
     * @param {Bitmap} bitmap
     * @param {number} x
     * @param {number} y
     * @param {number} [transparentColor]
     * @param {number} [sourceX]
     * @param {number} [sourceY]
     * @param {number} [width]
     * @param {number} [height]
     */
    drawBitmap(bitmap, x, y, transparentColor, sourceX, sourceY, width, height) { // TODO: UT
        let bitmapWidth = bitmap.getWidth();
        let bitmapHeight = bitmap.getHeight();
        sourceX = sourceX === undefined ? 0 : sourceX;
        sourceY = sourceY === undefined ? 0 : sourceY;
        width = width === undefined ? bitmapWidth : width;
        height = height === undefined ? bitmapHeight : height;
        transparentColor = transparentColor === undefined ? null : transparentColor;

        // Correct coordinates
        // Prevent coordinates out of the source bitmap
        let correction = -Math.min(sourceX, 0);
        sourceX += correction;
        width = Math.max(width - correction, 0);
        width -= width - Math.min(bitmapWidth - sourceX, width);
        correction = -Math.min(sourceY, 0);
        sourceY += correction;
        height = Math.max(height - correction, 0);
        height -= height - Math.min(bitmapHeight - sourceY, height);

        // Prevent coordinates out of the destination bitmap
        correction = -Math.min(x, 0);
        sourceX += correction;
        x += correction;
        width -= correction;
        correction = -Math.min(y, 0);
        sourceY += correction;
        y += correction;
        height -= correction;
        width -= width - Math.min(this.getWidth() - x, width);
        height -= height - Math.min(this.getHeight() - y, height);

        // Transfer pixels
        for (let xOff = 0; xOff < width; ++xOff) {
            for (let yOff = 0; yOff < height; ++yOff) {
                let sourceColor = bitmap.getPixel(xOff + sourceX, yOff + sourceY);
                if (sourceColor !== transparentColor) {
                    this.setPixel(xOff + x, yOff + y, sourceColor);
                }
            }
        }
    }

    /**
     * Draws text with a bitmap font by drawing a bitmap portion for each character. The text may
     * contain line breaks. The position is specified as the upper left coordinate of the rectangle
     * that will contain the text.
     *
     * @method module:bitmap_manipulation.Bitmap#drawText
     * @param {Font} font
     * @param {string} text
     * @param {number} x
     * @param {number} y
     */
    drawText(font, text, x, y) {
        let fontBitmap = font.getBitmap();
        let lineHeight = font.getLineHeight();
        let fontDetails = font.getDetails();
        let characterInfoMap = fontDetails.chars;
        let kernings = fontDetails.kernings;
        let transparentColor = font.getTransparentColor();
        let lines = text.split(/\r?\n|\r/);
        let lineX = x;
        for (let line of lines) {
            let lastCharacter = null;
            for (let i = 0; i < line.length; i++) {
                let character = line[i];
                let characterInfo = characterInfoMap[character];
                if (!characterInfo) {
                    continue;
                }
                let kerning = kernings[character];
                if (kerning && lastCharacter) {
                    kerning = kerning[lastCharacter];
                    if (kerning) {
                        x += kerning.amount;
                    }
                }
                this.drawBitmap(fontBitmap, x + characterInfo.xoffset, y + characterInfo.yoffset,
                    transparentColor, characterInfo.x, characterInfo.y, characterInfo.width,
                    characterInfo.height);
                x += characterInfo.xadvance;
            }
            x = lineX;
            y += lineHeight;
        }
    }
};
