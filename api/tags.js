const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');


tagsRouter.use((req, res, next) => {
    console.log('A request is being made to /tags');

    next();
});


tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        "tags": [tags]
    });
});


tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    

    try {
        const allPosts = await getPostsByTagName(tagName);

        const posts = allPosts.filter(post => {
            if (post.active) {
                return true;
            }

            if (req.user && post.author.id == req.user.id) {
                return true;
            }

            return false;

        });



        console.log("This should show only active and user posts", posts)
        res.send({
            posts
        });

    } catch ({ name, message }) {
        next({ 
            name: 'ErrorGettingTaggedPost',
            message: 'Cannot get post by that tag' })
    }
});


module.exports = tagsRouter;


// curl http://localhost:3000/api/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYwNDYzN30.i3pxk-vbGSj8Bv8gtwWSqFqGOL8rqakcYTFmcGr7O70'

// curl http://localhost:3000/api/tags/%23happy/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwibmFtZSI6Ik5ld25hbWUgU29nb29kIiwibG9jYXRpb24iOiJMZXN0ZXJ2aWxsZSwgS1kiLCJhY3RpdmUiOnRydWUsImlhdCI6MTY4MjYwNDYzN30.i3pxk-vbGSj8Bv8gtwWSqFqGOL8rqakcYTFmcGr7O70'

