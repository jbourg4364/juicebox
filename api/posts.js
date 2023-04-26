const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils');


postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })

            console.log("This is the updated post", updatedPost)
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        };
    } catch ({ name, message }) {
        next({ name, message })
    }
});


postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    const user = req.user;
    const tagArr = tags.trim().split(/\s+/);
    const postData = {
            authorId: user.id,
            title: title,
            content: content,
    };

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        console.log("This is postData", postData);

        const post = await createPost( postData );

        if (!post) {
            next({
            name: 'ErrorCreatingPost',
            message: 'There was an error creating post' });
        } else {
            res.send({ post });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
  });


postsRouter.use((req, res, next) => {
    console.log('A request is being made to /posts');

    next();
});


postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        "posts": [posts]
    });
});




module.exports = postsRouter;

