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


postsRouter.get('/', async (req, res, next) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
            if (post.active) {
                return true;
            }

            if (req.user && post.author.id === req.user.id) {
                return true;
            }

            return false;
        });
        // console.log("This is filtered posts", posts);
        res.send({
            posts
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});


postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
        
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

module.exports = postsRouter;

// curl http://localhost:3000/api/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYwNDI4OH0.bFboaybzrDByoqlibBWpavAjui2FWIJmuR5fTdks6mU'


