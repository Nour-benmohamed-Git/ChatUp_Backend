import jwt from 'jsonwebtoken';
const getUserIdFromToken = (token: string): number | null => {
  const secretKey = process.env.SECRET_KEY;
  try {
    const decodedToken = jwt.verify(token, secretKey) as {
      id: number;
      iat: number;
      exp: number;
    };
    return decodedToken.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export { getUserIdFromToken };
