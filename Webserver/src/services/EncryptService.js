const bcrypt = require("bcryptjs");

const saltRounds = 10;

exports.encrypt = async (password) => {
  try {
    //const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword)

    return hashedPassword;
    
  } catch (error) {
    // Handle errors that may occur during salt generation or password hashing
    throw new Error("Encryption failed: " + error.message);
  }
};

exports.compare = async (password1, password2) => {
  return await bcrypt.compare(password1, password2)
}
