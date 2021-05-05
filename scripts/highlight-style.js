/**
 * highlight-style.js defines highlight style functions
 * .
 * Name: chanhakim
 * Date: 05/04/2021
 */

/**
 * 
 * @param {*} pos : the (decoded) position of the highlight
 * @param {*} size : the size of the highlight
 * @param {*} color : the color of the highlight
 * @returns a solid circle of pos, size, and color
 */
function createSolidCircleHighlightStyle(pos, size, color) {

	var hShape = `border-radius: 100%;`;
	var hColor = `background-color: ${color}; opacity: 0.5;`;
	var hSize = `width:${16 * size.coeff}px; height:${16 * size.coeff}px;`;
	var hPosition = `left: ${pos.x - 8 * size.coeff}px; top: ${pos.y - 8 * size.coeff}px;`

	var hStyle = `position: absolute; pointer-events: none; ${hShape} ${hColor} ${hSize} ${hPosition}`;

	return hStyle;
}

/**
 * 
 * @param {*} pos : the (decoded) position of the highlight
 * @param {*} size : the size of the highlight
 * @param {*} color : the color of the highlight
 * @returns a gradient circle of pos, size, and color
 */
function createGradientCircleHighlightStyle(pos, size, color) {
	var hShapeAndColor = `background: radial-gradient(${color} 0%, #00ffffff 66%, #00ffffff; opacity: 0.7;`;
	var hSize = `width:${24 * size.coeff}px; height:${24 * size.coeff}px;`;
	var hPosition = `left: ${pos.x - 12 * size.coeff}px; top: ${pos.y - 12 * size.coeff}px;`

	var hStyle = `position: absolute; pointer-events: none; ${hShapeAndColor} ${hSize} ${hPosition}`;

	return hStyle;
}