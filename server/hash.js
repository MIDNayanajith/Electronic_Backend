import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);
//const hashedPassword = bcrypt.hashSync("admin123", salt);
const hashedPassword = bcrypt.hashSync("admin456", salt);

console.log("Hashed Password:", hashedPassword);
