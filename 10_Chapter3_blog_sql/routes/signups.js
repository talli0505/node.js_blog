const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const {Users} = require("../models");

// 회원가입 API
router.post("/sign", async (req, res) => {
  try {
    const {nickname, password, confirm} = req.body;                   // json.body : 닉네임, 비번, 확인 비번 받기

    // 아이디와 비번 정규식 표현
    let checkNickname = /^[a-zA-Z0-9]{3,30}$/
    let checkPassword = /^[a-zA-Z0-9]{4,30}$/

    if(!checkNickname.test(nickname)) {                              // 입력 아이디와 정규식 비교
      res.status(400).send({
        errorMessage: '아이디를 제대로 입력해주세요'
      })
      return
    }

    if(!checkPassword.test(password)) {                              // 비밀 번호와 정규식 비교 (중복 거르기)
      res.status(400).send({
        errorMessage: '비밀번호를 제대로 입력해주세요'
      })
      return
    }
  
    if(nickname.includes(password)) {                               // 비번이 아이디에 들어가있는 값인 경우
      res.status(400).send({
        errorMessage: '아이디와 비밀번호에 같은값이 들어가 있습니다.'
      })
      return
    }

    if (password !== confirm) {                                     // 비빌번호 와 한번 더 입력한게 다른 경우
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    }

    const existUsers = await Users.findAll({                        // 닉네임이 사용되는 경우
          where: {
            [Op.or]: [{ nickname } ],
          },
        });
    if (existUsers.length) {
      res.status(400).send({
        errorMessage: "닉네임이 이미 사용중입니다.",
      });
      return;
    }

    const user = new Users({nickname, password });                  // 생성 및 저장
    await user.save();

    res.status(201).send({user});
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

module.exports = router;