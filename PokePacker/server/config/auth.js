import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // GRAB TOKEN
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];

        // VALIDATE TOKEN
        const validToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = validToken;

        next();

    } catch(error)
    {
        return res.status(403).json({message: "Invalid token."});
    }
}