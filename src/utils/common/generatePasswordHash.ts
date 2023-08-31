import bcrypt from "bcrypt";

export async function generatePasswordHash(password: string): Promise<string> {
    const passwordSalt: string = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, passwordSalt)
}