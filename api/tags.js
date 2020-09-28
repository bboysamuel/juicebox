const express = require('express');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log('A request is being made to /tags');

  next();
});

const {
  getAllTags,
  updatePost,
  getPostById,
  getPostsByTagName,
} = require('../db');

tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  // read the tagname from the params
  const { tagName } = req.params;

  try {
    // use our method to get posts by tag name from the db
    // const getPostsByTag = await getAllPosts(tagname);
    const tagfilter = await getPostsByTagName(tagName);

    // res.send({ tagfilter });

    // if (post.active)

    // update this method to filter out any posts which are both inactive and not owned by the current user.

    const posts = tagfilter.filter((post) => {
      if (post.active || (req.user && post.author.id === req.user.id)) {
        return true;
      }
    });
    res.send({ posts });

    // send out an object to the client { posts: // the posts }
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    next({ name, message });
  }
});

module.exports = tagsRouter;
