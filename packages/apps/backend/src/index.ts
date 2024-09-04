const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "your_jwt_secret_key"; // JWT 비밀 키

// 사용자의 OTP 비밀 키를 저장할 간단한 메모리 저장소
const users = {}; // { userId: { secret: 'otp_secret', ... } }

// QR 코드 생성 및 TOTP 비밀 키 발급 (사용자가 처음 등록할 때)
app.post("/register", (req, res) => {
  const { userId } = req.body; // 클라이언트에서 사용자 ID를 전달했다고 가정

  // 새로운 TOTP 비밀 키 생성
  const secret = speakeasy.generateSecret({ length: 20 });

  // 사용자의 비밀 키 저장 (데이터베이스 대신 메모리 저장소에 저장)
  users[userId] = { secret: secret.base32 };

  // OTP 비밀 키를 기반으로 QR 코드 생성
  const otpAuthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `MyApp (${userId})`,
    issuer: "MyApp",
  });

  qrcode.toDataURL(otpAuthUrl, (err, imageUrl) => {
    if (err) {
      return res.status(500).json({ message: "Failed to generate QR code" });
    }
    res.json({ imageUrl });
  });
});

// 로그인 및 OTP 검증
app.post("/login", (req, res) => {
  const { userId, otp } = req.body;

  // 사용자 비밀 키 조회
  const user = users[userId];
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // OTP 검증
  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: "base32",
    token: otp,
  });

  if (verified) {
    // OTP가 유효하면 JWT 생성
    const token = jwt.sign({}, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Authenticated successfully", token });
  } else {
    res.status(401).json({ message: "Invalid OTP" });
  }
});

// 보호된 리소스 접근 (JWT 인증 필요)
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    res.json({ message: "This is protected data" });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
