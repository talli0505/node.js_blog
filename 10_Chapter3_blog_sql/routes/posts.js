const express = require("express");
const {Posts} = require("../models");
const {Likes} = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware")
const router = express.Router();

// 게시글 작성
router.post('/posts', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const {userId, nickname} = res.locals.user

    await Posts.create({ userId, nickname, title, content });

    res.json({ "message" : "게시글이 작성에 성공하였습니다." })
})

// 게시글 조회
router.get('/posts', async (req, res) => {
    // sort가 가능한지 한번 확인
    const dataAll = await Posts.findAll({
        order: [['createdAt', 'DESC']],
    })

    const data = []
    for (let i = 0; i < dataAll.length; i++) {
        data.push({
            postId: dataAll[i].postId,
            userId: dataAll[i].userNum,
            user: dataAll[i].user,
            title: dataAll[i].title,
            createdAt: dataAll[i].createdAt,
            updatedAt: dataAll[i].updatedAt,
            likes : dataAll[i].likes,
        });
    }

    res.json({ data : data });
})


// 좋아요 게시글 조회 -> 상세 조회 밑에 있으면 :postId가 likes를 string으로 잡아먹음 무조건 상세조회 위로
router.get('/posts/likes', authMiddleware, async (req, res) => {
    // 여기도 sort가능한지 확인
    const dataAll = await Posts.findAll({
        order: [['likes', 'DESC']],
    })

    const data = []
    for (let i = 0; i < dataAll.length; i++) {
        data.push({
            postId: dataAll[i].postId,
            userId: dataAll[i].userNum,
            nickname: dataAll[i].nickname,
            title: dataAll[i].title,
            createdAt: dataAll[i].createdAt,
            updatedAt: dataAll[i].updatedAt,
            likes: dataAll[i].likes
        });
    }

    res.json({ data : data });
})


// 게시글 상세 조회
router.get('/posts/:postId', authMiddleware, async (req, res) => {
    const {postId} = req.params;

    const currentPost = await Posts.findAll({
        where: {
        postId
        }
    });

    if (!currentPost.length) {
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    const data = 
        {
            postId: currentPost[0].postId,
            userId : currentPost[0].userNum,
            nickname: currentPost[0].user,
            title: currentPost[0].title,
            content: currentPost[0].content,
            createdAt: currentPost[0].createdAt,
            likes : currentPost[0].likes,
        }

    res.json({ data });
})

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const {password} = res.locals.user

    const { title, content, current_password } = req.body;

    const currentPost = await Posts.findAll({
        where: {
            postId
        }});

    if (!currentPost.length) {
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (current_password !== password) {
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
    }
    await Posts.update(
        { 
            title:title, content:content
        },
        {where:{ postId }});

    res.json({ "message" : "게시글이 수정하였습니다." })
})

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { current_password } = req.body
    const {password} = res.locals.user


    const currentPost = await Posts.findOne({ 
        where:
        {postId} 
    });

    if (!currentPost.length) {
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (current_password !== password) {
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
    }

    await Posts.destroy({
        where:
        {postId : postId}
    });


    res.json({ "message" : "게시글이 삭제하였습니다." })
})

////// 좋아요와 좋아요 게시글
// 게시글 좋아요
router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user
    const { likes } = req.body
    
    const findPost = await Posts.findAll({
    where: {
        postId, userId: userId
    }})

    if(findPost) {
        if(likes === 1) {
            await Posts.increment({likes: 1},{where : {postId}})
            res.json({ 'message' : '게시글의 좋아요를 등록하였습니다.'})
        } else {
            await Posts.decrement({likes: 1},{where : {postId}})
            res.json({ 'message' : '게시글의 좋아요를 취소하였습니다.'})
        }
    }
})


module.exports = router;