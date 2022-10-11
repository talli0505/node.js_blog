const express = require("express");
const {Posts} = require("../models");
const {Likes} = require("../models");
const authMiddleware = require("../middlewares/auth-middleware")
const router = express.Router();

// 게시글 작성
router.post('/posts', authMiddleware, async (req, res) => {
    const { title, content } = req.body;                            // json.body : title, body 받기
    const {userId, nickname} = res.locals.user                      // 로그인 계정 : id, nickname 받기

    await Posts.create({ userId, nickname, title, content });       // 생성하기

    res.json({ "message" : "게시글이 작성에 성공하였습니다." })
})

// 게시글 조회
router.get('/posts', async (req, res) => {
    const dataAll = await Posts.findAll({                           // content를 제외하고, createdAt 순으로 찾기
        attributes : {exclude: ['content']},
        order: [['createdAt', 'DESC']],
    })

    res.json({ data : dataAll });                                   // 넣기
})


// 좋아요 게시글 조회 -> 상세 조회 밑에 있으면 :postId가 likes를 string으로 잡아먹음 무조건 상세조회 위로
router.get('/posts/likes', authMiddleware, async (req, res) => {
    const {userId} = res.locals.user                                // 로그인 계정 : id 받기

    const dataAll = await Posts.findAll({                           // likes 순으로 찾기
        order: [['likes', 'DESC']],
    })

    const userPost = await Likes.findOne({                          // 좋아요 표에서 userId만 찾은 정보
        where: {
            userId
        },
    })

    const data = []
    for (let i = 0; i < dataAll.length; i++) {
        // 좋아요에서 찾은 userId === 접속한 계정 userId && 좋아요에서 찾은 postId === 게시글 전체에서 찾은 postId 
        if(userPost.userId === userId && userPost.postId === dataAll[i].postId) {
            data.push({
                postId: dataAll[i].postId,
                userId: userId,
                nickname: dataAll[i].nickname,
                title: dataAll[i].title,
                createdAt: dataAll[i].createdAt,
                updatedAt: dataAll[i].updatedAt,
                likes: dataAll[i].likes
            });
        }
    }

    res.json({ data : data });                                      // 넣기
})


// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
    const {postId} = req.params;                                    // 경로에 넣은 postId 받기

    const currentPost = await Posts.findAll({                       // postId값이 같은 것만 찾기
        where: {
        postId
        }
    });

    if (!currentPost.length) {                                      // 게시글 없을때
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    res.json({ currentPost });                                      // 넣기
})

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;                                  // 경로에 넣은 postId 받기 
    const {password} = res.locals.user                              // 로그인 계정 : password 받기

    const { title, content, current_password } = req.body;          // json.body 받기

    const currentPost = await Posts.findAll({                       // postID값이 같은걸 찾기
        where: {
            postId
        }});

    if (!currentPost.length) {                                      // 게시글 없으면
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (current_password !== password) {                            // 입력 비번, 로그인 비번 다를때
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
    }
    await Posts.update(                                             // 내용 수정
        { 
            title:title, content:content
        },
        {where:{ postId }});

    res.json({ "message" : "게시글이 수정하였습니다." })
})

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params                                   // 경로에 넣은 postId 받기 
    const {password} = res.locals.user                              // 로그인 계정 : 비번 받기
    const { current_password } = req.body                           // json.body : 확인할 비번 받기


    const currentPost = await Posts.findOne({                       // postId 같은거 찾기
        where:
        {postId: postId} 
    });

    if (!currentPost.length) {                                      // 게시글이 없을때
        return res.status(400).json({ success: false, errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (current_password !== password) {                            // 입력 비번, 로그인 비번 다를때
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 다릅니다." });
    }

    await Posts.destroy({                                           // 삭제
        where:
        {postId : postId}
    });


    res.json({ "message" : "게시글이 삭제하였습니다." })
})

// 게시글 좋아요
router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
    const { postId } = req.params                                   // 경로에 넣은 postId 받기 
    const { userId } = res.locals.user                              // 로그인 계정 : userid 받기
    const { likes } = req.body                                      // json.body : like넣기
    
    const findPost = await Posts.findAll({                          // 게시글표에서 postid, userid 같은거 찾기
    where: {
        postId, userId: userId
    }})

    const userPost = await Likes.findOne({                          // 좋아요표에서 uerid 같은거
        where: {
            userId
        }
    })

    if(findPost) {                                                  // 게시글 있을때
        if(likes === 1) {                                           // json.body값이 1이면
            if(userPost) {                                          // 이때 이미 1을 눌렀으면
                res.status(400).json({'message': '이미 좋아요를 했습니다.'})
            } else {                                                // 안눌렀으면 추가
                await Likes.create({postId, userId})
                await Posts.increment({likes: 1},{where : {postId}})
                res.json({ 'message' : '게시글의 좋아요를 등록하였습니다.'})
            }    
        } else {                                                    // json.body값이 1아니면 삭제
            await Likes.destroy({where:{postId, userId}})   
            await Posts.decrement({likes: 1},{where : {postId}})
            res.json({ 'message' : '게시글의 좋아요를 취소하였습니다.'})
        }
    }
})

module.exports = router;