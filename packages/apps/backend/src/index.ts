const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 80;
const OTP_SECRET_KEY = 'nvideo';
const JWT_SECRET_KEY = 'your_jwt_secret_key'; // JWT 비밀 키

// test:
app.get('/', (req, res) => {
  res.json('test');
});

// QR 코드 생성 및 TOTP 비밀 키 발급 (사용자가 처음 등록할 때)
app.post('/register', (req, res) => {
  // 새로운 TOTP 비밀 키 생성
  // const secret = speakeasy.generateSecret({ length: 20 });

  // OTP 비밀 키를 기반으로 QR 코드 생성
  const otpAuthUrl = speakeasy.otpauthURL({
    secret: OTP_SECRET_KEY,
    label: `MyApp cch`,
    issuer: 'MyApp',
  });

  qrcode.toDataURL(otpAuthUrl, (err, imageUrl) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to generate QR code' });
    }
    res.json({ imageUrl });
  });
});

// 로그인 및 OTP 검증
app.post('/login', (req, res) => {
  const { otp } = req.body;

  // 사용자 비밀 키 조회
  // const user = users[userId];
  // if (!user) {
  //   return res.status(400).json({ message: 'User not found' });
  // }

  // OTP 검증
  const verified = speakeasy.totp.verify({
    secret: OTP_SECRET_KEY,
    encoding: 'base32',
    token: otp,
  });

  if (verified) {
    // OTP가 유효하면 JWT 생성
    const token = jwt.sign({}, JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Authenticated successfully', token });
  } else {
    res.status(401).json({ message: 'Invalid OTP' });
  }
});

// 보호된 리소스 접근 (JWT 인증 필요)
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET_KEY, err => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ message: 'This is protected data' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
