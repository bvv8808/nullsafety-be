const jwt = require("jsonwebtoken");

export default (k: string) => {
  if (k !== process.env.ADMIN) return null;

  return jwt.sign({ key: k }, process.env.SECRET, { expiresIn: "1d" });
};
