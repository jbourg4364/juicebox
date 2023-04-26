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
        const post = await getPostsByTagName(tagName);
        // console.log("This is the Posts from Tag", post);
        res.send(post)

    } catch ({ name, message }) {
        next({ 
            name: 'ErrorGettingTaggedPost',
            message: 'Cannot get post by that tag' })
    }
});


module.exports = tagsRouter;



