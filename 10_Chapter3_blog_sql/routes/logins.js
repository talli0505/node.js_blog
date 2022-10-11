const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {Users} = require("../models")

// 로그인
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;                            // json.body : 닉네임, 비번 받기

  const user = await Users.findOne({                                  // User에서 nickname 같은거 찾기
    where:
    {nickname}
  });

  if (!user || password !== user.password) {                          // user 없거나 비번 다르면
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  }

  res.send({                                                          // 토큰값 받기
    token: jwt.sign({ userId: user.userId }, "my-secret-key"),
  });
});

module.exports = router;