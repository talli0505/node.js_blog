const express = require("express");
const signupRouter = require("./routes/signups")
const loginRouter = require("./routes/logins")
const postRouter = require("./routes/posts")
const commentRouter = require("./routes/comments")

const app = express();

app.use(express.json());

app.use([signupRouter, loginRouter, postRouter, commentRouter])

app.listen(3000, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});