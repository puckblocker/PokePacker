import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db.js';

const router = express.Router();

// CREATE USER POST ROUTE
router.post(`/loginUser`, async (req, res) => {
  const {userName, password} = req.body;

  // CHECK USERNAME AGAINST DATABASE
  try {
    const result = await pool.query(
      `SELECT status, password_hash, id, type, denial_reason FROM account WHERE username = $1`,  // $1 to combat sql injection
      [userName]
    );

    // CHECK FOR VALID ACCOUNT
    if (result.rows.length === 0)
    {
      return res.status(401).json({message: `Invalid Login.`});
    }


    // VALIDATE LOGIN INFO
    const type = result.rows[0].type;
    const storedHash = result.rows[0].password_hash;
    const id = result.rows[0].id;
    const validPassword = bcrypt.compareSync(password, storedHash);


    // REJECT LOGIN
    if(!validPassword)
    {
        return res.status(401).json({message: `Invalid Login.`});
    }
  
    //MADISON CODE: PASSWORD DENAL REASONING STUFF
    if (result.rows[0].status == 'denied'){
      return res.status(403).json({
        message: `Your account was denied. Reason ${result.rows[0].denial_reason}`
      });
    }


       //Check for account approval (madison)
    if (result.rows[0].status !== 'approved'){
      return res.status(403).json({
        message: 'Your account is awaiting admin aproval'
      });

    }

    // GENERATE JWT TOKEN
    const token = jwt.sign({ 
        username: userName,
        id: id,
        type: type},
        process.env.JWT_SECRET,
        {
            expiresIn: "2 minutes",
            algorithm: 'HS256'
        });

    // NOTIFY FRONTEND OF LOGIN
    return res.status(200).json({
        message: `Successful Login.`,
        token: token,
        user: userName,
        type: type
    });
  } 
  catch(error) 
  {
    console.error(`Error executing query,`, error);
    return res.status(500).json({error: `Internal server error`});
  }
})

export default router;