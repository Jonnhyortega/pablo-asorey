// Sin fallback: si falta JWT_SECRET preferimos que falle a firmar tokens con un secreto público.
export function getJwtSecretString(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }
  return secret;
}

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtSecretString());
}
