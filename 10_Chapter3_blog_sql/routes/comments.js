const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware")
const {Posts} = require("../models")
const {Comments} = require("../models")
const {Users} = require("../models")
const router = express.Router();


// 댓글 생성
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  const {postId} = req.params
  const {userId, nickname} = res.locals.user
  console.log(userId, nickname)
  const {comment} = req.body

  const CurrentPosts = await Posts.findAll({ 
    where:
      {postId} 
    });

    if (!CurrentPosts.length) {
      return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    await Comments.create({ postId, userId, nickname, comment });

    
    res.json({ "message" : "댓글을 작성하였습니다." })

})


// 댓글 목록 조회
router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params; 
  const currentPosts = await Posts.findAll({
    where: {
      postId
    }});


  if (!currentPosts.length) {
    return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
  }

  // sort 알아보기..
  const allCommentInfo = await Comments.findAll({
    where: {
      postId
    }});

  const data = []
    for (let i = 0; i < allCommentInfo.length; i++) {
        data.push({
            commentId: allCommentInfo[i].commentId,
            userId: allCommentInfo[i].userId,
            nickname: allCommentInfo[i].nickname,
            comment: allCommentInfo[i].comment,
            createdAt: allCommentInfo[i].createdAt,
            updatedAt: allCommentInfo[i].updatedAt,
        });
    }

    res.json({ data : data });

})


// 댓글 수정
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params
  const {password} = res.locals.user
  const { comment, current_password } = req.body
  const currentComments = await Comments.findAll({
    where:{
      commentId 
    }});

  if (!currentComments.length) {
    return res.status(400).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
  }

  if (current_password !== password) {
    return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
}
  await Comments.update(
    {comment: comment},
    {where : {
      commentId
    }}
  );

  res.json({ "message" : "댓글을 수정하였습니다." })
})


// 댓글 삭제
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params
    const {password} = res.locals.user
    const { current_password } = req.body

    const currentComments = await Comments.findAll({
      where: {
        commentId 
      }});


    if (!currentComments.length) {
      return res.status(400).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
    }

    if (current_password !== password) {
      return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });


    }
    await Comments.destroy({
      where:
      {commentId : commentId}
  });

    res.json({ "message" : "댓글을 삭제하였습니다." })
})

module.exports = router;