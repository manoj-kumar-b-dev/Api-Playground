import bcrypt from "bcryptjs";

const SALT_ROUND = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUND);
  return bcrypt.hash(password, salt);
}

export const comparePassword = async(password:string,hash:string): Promise<boolean>=>{
  return await bcrypt.compare(password,hash)
}