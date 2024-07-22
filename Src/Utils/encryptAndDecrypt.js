import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js';


export const generateToken = ( {payload = {}, signature = process.env.TOKEN_SIGNATURE,expiresIn = 60 * 60} ) => {
    const token = jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn) });
    return token
}

export const decryptToken = ({ token, signature = process.env.TOKEN_SIGNATURE } = {}) => {
    return jwt.verify(token, signature, (err, result) => {
        if (err) {
          return undefined;
        } else {
          return result;
        }
    })
}


export const encryptCrypto=(payload,signature=process.env.CRYPTO_SIGNATURE)=>{
    const encoded = CryptoJS.AES.encrypt(payload,signature).toString;
    return encoded
}

export const decryptCrypto=(encrypted,signature=process.env.CRYPTO_SIGNATURE)=>{
    const decoded = CryptoJS.AES.decrypt(encrypted,signature);
    return decoded
}