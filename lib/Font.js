"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const BMPBitmap = require("./BMPBitmap");

/**
 * Creates a bitmap font that's read from JSON and image files. There's a main JSON file that
 * references another JSON file for each provided font size (unit: pixels). Use {@link
    * http://www.angelcode.com/products/bmfont/|BMFont} to create an <code>.fnt</code> and image file
 * (one page) for each desired font size. Then, use the {@link
    * https://github.com/mattdesl/bmfont2json|bmfont2json} tool with the switch
 * <code>--image-file-extension</code> for converting from <code>.fnt</code> to <code>.json</code>
 * and convert the image files to 8-bit <code>.bmp</code> files. (They have to have a black
 * background and white glyph pixels.)
 *
 * @class
 * @param {string} filePath Path to the JSON main file of the font
 * @see Example font
 */
module.exports = class Font {

    constructor(filePath) {
        this._firstSize = null;
        this._detailsAndBitmapToSize = [];
        this._size = null;
        this._transparentColor = null;
        this._color = null;

        // Read JSON main and subfiles, create Bitmaps
        let json = fs.readFileSync(filePath); // throws Error
        let filesAndSizes = JSON.parse(json); // throws SyntaxError
        assert(filesAndSizes instanceof Array && filesAndSizes.length >= 1);
        let lastDetailsAndBitmap;
        for (let fileAndSize of filesAndSizes) {
            assert(fileAndSize.size && fileAndSize.filename);
            // Read JSON subfile (specification:
            // https://github.com/mattdesl/bmfont2json/wiki/JsonSpec)
            let detailsAndBitmap = {};
            this._detailsAndBitmapToSize[fileAndSize.size] = detailsAndBitmap;
            json = fs.readFileSync(path.join(path.dirname(filePath), fileAndSize.filename));
            // throws Error
            detailsAndBitmap.details = JSON.parse(json); // throws SyntaxError
            assert(
                !lastDetailsAndBitmap || (
                    detailsAndBitmap.details.info.face === lastDetailsAndBitmap.details.info.face &&
                    detailsAndBitmap.details.info.bold === lastDetailsAndBitmap.details.info.bold &&
                    detailsAndBitmap.details.info.italic === lastDetailsAndBitmap.details.info.italic
                )
            );
            // Restructure details object to make the data accessible by character keys
            let newChars = {};
            for (let char of detailsAndBitmap.details.chars) {
                newChars[String.fromCodePoint(char.id)] = char;
                delete char.id;
            }
            detailsAndBitmap.details.chars = newChars;
            let newKernings = {};
            for (let kerning of detailsAndBitmap.details.kernings) {
                let firstChar = String.fromCodePoint(kerning.first);
                let secondChar = String.fromCodePoint(kerning.second);
                let newKerning = newKernings[secondChar];
                if (!newKerning) {
                    newKerning = newKernings[secondChar] = {};
                }
                newKerning[firstChar] = kerning;
                delete kerning.first;
                delete kerning.second;
            }
            detailsAndBitmap.details.kernings = newKernings;
            // Create bitmap from font image file
            assert(detailsAndBitmap.details.pages.length >= 1);
            detailsAndBitmap.bitmap = BMPBitmap.fromFile(
                path.join(path.dirname(filePath), detailsAndBitmap.details.pages[0]));
            let palette = detailsAndBitmap.bitmap.getPalette();
            let currentColor = palette.indexOf(0x000000/*black*/);
            assert(currentColor > -1);
            this._transparentColor = palette.indexOf(0xff00ff/*magenta*/);
            if (this._transparentColor === -1) {
                this._transparentColor = 0x80;
            }
            detailsAndBitmap.bitmap.replaceColor(currentColor, this._transparentColor);
            this._color = palette.indexOf(0xffffff/*white*/);
//			currentColor = palette.indexOf(0xffffff/*white*/);
//			this._color = palette.indexOf(0x000000/*black*/);
//			assert(currentColor > -1 && this._color > -1);
//			detailsAndBitmap.bitmap.replaceColor(currentColor, this._color);
            lastDetailsAndBitmap = detailsAndBitmap;
        }
        // Set size variables to first available
        for (
            this._firstSize = 0, this._size = 0;
            this._size < this._detailsAndBitmapToSize.length;
            this._firstSize++, this._size++
        ) {
            if (this._detailsAndBitmapToSize[this._size]) {
                break;
            }
        }
    }

    /**
     * @method module:bitmap_manipulation.Font#getName
     * @returns {string}
     */
    getName() {
        return this._detailsAndBitmapToSize[this._firstSize].details.info.face;
    }

    /**
     * @method module:bitmap_manipulation.Font#getSizes
     * @returns {number[]} The available font sizes in pixels
     */
    getSizes() {
        let sizes = [];
        for (let size = this._firstSize; size < this._detailsAndBitmapToSize.length; size++) {
            if (this._detailsAndBitmapToSize[size]) {
                sizes.push(size);
            }
        }
        return sizes;
    }

    /**
     * @method module:bitmap_manipulation.Font#getSize
     * @returns {number} The font size in pixels
     */
    getSize() {
        return this._size;
    }

    /**
     * @method module:bitmap_manipulation.Font#setSize
     * @param {number} size The font size in pixels
     */
    setSize(size) {
        if (!this._detailsAndBitmapToSize[size]) {
            throw new Error("The size doesn't exist");
        }
        this._size = size;
    }

    /**
     * @method module:bitmap_manipulation.Font#isBold
     * @returns {boolean}
     */
    isBold() {
        return Boolean(this._detailsAndBitmapToSize[this._firstSize].details.info.bold);
    }

    /**
     * @method module:bitmap_manipulation.Font#isItalic
     * @returns {boolean}
     */
    isItalic() {
        return Boolean(this._detailsAndBitmapToSize[this._firstSize].details.info.italic);
    }

    /**
     * @method module:bitmap_manipulation.Font#getColor
     * @returns {number} The color of the current font size
     */
    getColor() {
        return this._color;
    }

    /**
     * Sets the font color of the current font size. This refers to the raw pixel value and will
     * perform a color replace action on the Bitmap of the current font size.
     *
     * @method module:bitmap_manipulation.Font#setColor
     * @param {number} newColor
     */
    setColor(newColor) {
        this._detailsAndBitmapToSize[this._size].bitmap.replaceColor(this._color, newColor);
        this._color = newColor;
    }

    /**
     * @method module:bitmap_manipulation.Font#getTransparentColor
     * @returns {number}
     */
    getTransparentColor() {
        return this._transparentColor;
    }

    /**
     * @method module:bitmap_manipulation.Font#getLineHeight
     * @returns {number} The line height of the current font size
     */
    getLineHeight() {
        return this._detailsAndBitmapToSize[this._size].details.common.lineHeight;
    }

    /**
     * @method module:bitmap_manipulation.Font#setLineHeight
     * @param {number} lineHeight The line height of the current font size
     */
    setLineHeight(lineHeight) {
        this._detailsAndBitmapToSize[this._size].details.common.lineHeight = lineHeight;
    }

    /**
     * @method module:bitmap_manipulation.Font#getBaseLineY
     * @returns {number} The y-coordinate of the base line of the current font size
     */
    getBaseLineY() {
        return this._detailsAndBitmapToSize[this._size].details.common.base;
    }

    /**
     * @method module:bitmap_manipulation.Font#getDetails
     * @returns {Object} The object read from the JSON file of the current font size (restructured)
     */
    getDetails() {
        return this._detailsAndBitmapToSize[this._size].details;
    }

    /**
     * @method module:bitmap_manipulation.Font#getBitmap
     * @returns {Bitmap} The {@link Bitmap} of the current font size
     */
    getBitmap() {
        return this._detailsAndBitmapToSize[this._size].bitmap;
    }

    /**
     * Measures the dimensions of the provided text.
     *
     * <em>Note:</em> As for now, this performs some duplicate calculations when calling
     * {@link Bitmap#drawText} thereafter.
     *
     * @method module:bitmap_manipulation.Font#measure
     * @param {string} text
     * @returns {Object} An object with the members <code>width</code> and <code>height</code>
     */
    measure(text) {
        let detailsAndBitmap = this._detailsAndBitmapToSize[this._size];
        let lineHeight = detailsAndBitmap.details.common.lineHeight;
        let width = 0;
        let height = 0;
        let characterInfoMap = detailsAndBitmap.details.chars;
        let kernings = detailsAndBitmap.details.kernings;
        let lines = text.split(/\r?\n|\r/);
        for (let line of lines) {
            let lineWidth = 0;
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
                        lineWidth += kerning.amount;
                    }
                }
                lineWidth += characterInfo.xadvance;
            }
            width = Math.max(width, lineWidth);
            height += lineHeight;
        }
        return {
            width: width,
            height: height
        };
    }
};
