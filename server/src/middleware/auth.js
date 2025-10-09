import jwt from 'jsonwebtoken'

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Missing token' })
  try {
    console.log('JWT_SECRET used for verification in auth.js:', process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production')
    console.log('JWT Payload:', payload);
    
    // Handle different possible ID field names in the JWT payload
    const userId = payload.id || payload.userId || payload.principalId || payload._id;
    
    if (!userId) {
      console.error('No user ID found in JWT payload');
      console.log('JWT payload:', payload);
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    
    // Set the user object with consistent field names
    req.user = {
      id: userId,
      role: payload.role
    };
    
    console.log('User authenticated with ID:', userId, 'Role:', payload.role);
    
    console.log('Authenticated user:', req.user);
    next()
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' })
  }
}
