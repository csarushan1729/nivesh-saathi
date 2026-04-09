export const C = {
  saffron:      "#FF6B00",
  saffronLight: "#FFF0E5",
  saffronDark:  "#CC5500",
  green:        "#00875A",
  greenLight:   "#E3F5EE",
  blue:         "#0057FF",
  blueLight:    "#E5EEFF",
  bg:           "#F7F7F5",
  card:         "#FFFFFF",
  text:         "#1A1A1A",
  textSec:      "#4A4A4A",
  muted:        "#6B6B6B",
  border:       "#E8E8E4",
  red:          "#D72B2B",
  redLight:     "#FDECEA",
  amber:        "#E07A00",
  amberLight:   "#FFF4E0",
  purple:       "#7C3AED",
  purpleLight:  "#F3E8FF",
};

export const fmt  = (n) => "₹" + Number(n).toLocaleString("en-IN");
export const fmtK = (n) => {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};