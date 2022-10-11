const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware")
const {Posts} = require("../models")
const {Comments} = require("../models")
const router = express.Router();


// 댓글 생성
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  const {postId} = req.params                                                 // 경로에 넣은 postid 받기
  const {userId, nickname} = res.locals.user                                  // 로그인 계정 : userid, nickname 받기
  const {comment} = req.body                                                  // json.body : comment 받기

  const CurrentPosts = await Posts.findAll({                                  // 게시글에서 postid 같은거 찾기
    where:
      {postId} 
    });

    if (!CurrentPosts.length) {                                               // 게시글 없을때
      return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    await Comments.create({ postId, userId, nickname, comment });             // 댓글 생성

    
    res.json({ "message" : "댓글을 작성하였습니다." })

})


// 댓글 목록 조회
router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;                                              // 경로에 있는 postid 받기
  const currentPosts = await Posts.findAll({                                  // 게시글에서 postid 같은거 찾기
    where: {
      postId
    }});


  if (!currentPosts.length) {                                                 // 게시글 없을때
    return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
  }

  
  const allCommentInfo = await Comments.findAll({                             // postid 를 제외한 postid값 같은거 찾기
    attributes : {exclude: ['postId']},
    where: {
      postId
    }});

    res.json({ data : allCommentInfo });                                      // 넣기
})


// 댓글 수정
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params                                           // 경로에 넣은 postid 받기
  const {password} = res.locals.user                                         // 로그인 경로 : 비밀번호 받기
  const { comment, current_password } = req.body                             // json body : 댓글, 비번확인
  const currentComments = await Comments.findAll({                           // 댓글에서 commentid 같은 값 찾아오기
    where:{
      commentId 
    }});

  if (!currentComments.length) {                                              // 댓글 없을때
    return res.status(400).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
  }

  if (current_password !== password) {                                        // 비밀번호 다를때
    return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
}
  await Comments.update(                                                      // 수정
    {comment: comment},
    {where : {
      commentId
    }}
  );

  res.json({ "message" : "댓글을 수정하였습니다." })
})


// 댓글 삭제
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params                                          // 경로에 있는 commentid 받기
    const {password} = res.locals.user                                        // 로그인 계정 : 비번 받기
    const { current_password } = req.body                                     // json.body : 비번 확인할거 받기

    const currentComments = await Comments.findAll({                          // 댓글에서 commentid 같은거 찾기
      where: {
        commentId 
      }});


    if (!currentComments.length) {                                            // 댓글이 없을때
      return res.status(400).json({ success: false, errorMessage: "댓글이 존재하지 않습니다." });
    }

    if (current_password !== password) {                                      // 비밀번호가 다를때 
      return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
    }
    await Comments.destroy({                                                  // 삭제
      where:
      {commentId : commentId}
  });

    res.json({ "message" : "댓글을 삭제하였습니다." })
})

module.exports = router;