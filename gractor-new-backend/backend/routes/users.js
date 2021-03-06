const router = require("express").Router();
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

router.get("/register", (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({
        email: "해당 이메일을 가진 사용자가 존재합니다.",
      });
    } else {
      const newUser = new User({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;

          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.get("/login", (req, res) => {
  res.send("GET Login");
});
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // email로 회원 찾기
  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = "해당하는 회원이 존재하지 않습니다.";
      return res.status(400).json(errors);
    }

    // 패스워드 확인
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // 회원 비밀번호가 일치할 때
        // JWT PAYLOAD 생성
        const payload = {
          id: user.id,
          name: user.name,
        };

        // JWT 토큰 생성
        // 1시간 동안 유효
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "패스워드가 일치하지 않습니다.";
        return res.status(400).json(errors);
      }
    });
  });
});

module.exports = router;
