import crypto from "crypto";

export const generateResetToken = async () => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const tokenExpiration = new Date(Date.now() + 10 * 60 * 1000);
    return { resetToken, hashedToken, tokenExpiration };
};