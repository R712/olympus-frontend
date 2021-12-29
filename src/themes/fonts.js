import SquareWOFF from "../assets/fonts/TitilliumWeb-Regular.woff";
import SquareBoldWOFF from "../assets/fonts/TitilliumWeb-Bold.woff";
import SquareSemiBoldWOFF from "../assets/fonts/TitilliumWeb-SemiBold.woff";
import SquareItalicWOFF from "../assets/fonts/TitilliumWeb-Italic.woff";
import SquareLightWOFF from "../assets/fonts/TitilliumWeb-Light.woff";
import SquareMediumWOFF from "../assets/fonts/TitilliumWeb-SemiBold.woff";

const square = {
  fontFamily: "Titillium Web",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 400,
  src: `
		local('Titillium Web'),
		local('Titillium Web-Regular'),
		url(${SquareWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const squareLight = {
  fontFamily: "Titillium Web",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 300,
  src: `
		local('EuclidSquare'),
		local('EuclidSquare-Light'),
		url(${SquareLightWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const squareMedium = {
  fontFamily: "Titillium Web",
  fontStyle: "medium",
  fontDisplay: "swap",
  fontWeight: 500,
  src: `
		local('Titillium Web'),
		local('Titillium Web-Medium'),
		url(${SquareMediumWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const squareSemiBold = {
  fontFamily: "Titillium Web",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 600,
  src: `
		local('Titillium Web-SemiBold'),
		local('Titillium Web-SemiBold'),
		url(${SquareSemiBoldWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const squareBold = {
  fontFamily: "Titillium Web",
  fontStyle: "bold",
  fontDisplay: "swap",
  fontWeight: 700,
  src: `
		local('Titillium Web-Bold'),
		local('Titillium Web-Bold'),
		url(${SquareBoldWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const squareItalic = {
  fontFamily: "Titillium Web",
  fontStyle: "italic",
  fontDisplay: "swap",
  fontWeight: 400,
  src: `
		local('Titillium Web-Italic'),
		local('Titillium Web-Italic'),
		url(${SquareItalicWOFF}) format('woff')
	`,
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF",
};

const fonts = [square, squareLight, squareMedium, squareBold, squareItalic];

export default fonts;
