const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {Users} = require("../models")

// 로그인
router.post("/login", async (req, res) => {
  // 아이디 , 비밀번호 가져오기
  const { nickname, password } = req.body;

  const user = await Users.findOne({ nickname });

  if (!user || password !== user.password) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  }

  res.send({
    token: jwt.sign({ userId: user.userId }, "my-secret-key"),
  });
});

module.exports = router;