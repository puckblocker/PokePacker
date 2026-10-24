import bcrypt from 'bcrypt';

const password = 'Testmewtoo!';
const hash = await bcrypt.hash(password, 10);

console.log(hash);