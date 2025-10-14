import bcrypt from "bcryptjs"

const saltRounds = 10;

export const encrypt = async (password: string) => {
  try {
    //const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
    
  } catch (error: unknown) {
    // Handle errors that may occur during salt generation or password hashing
     if (error instanceof Error) {
      throw new Error("Encryption failed: " + error.message);
    }
    throw new Error("Encryption failed due to an unknown error.");
  }
};

export const compare = async (password1, password2) => {
  return await bcrypt.compare(password1, password2)
}