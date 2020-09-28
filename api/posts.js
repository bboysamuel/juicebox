const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, getPostById, updatePost } = require('../db');
const { requireUser } = require('./utils');

postsRouter.use((req, res, next) => {
  console.log('request to /posts');
  next();
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  // res.send({ message: 'under construction' });
  const user = req.user;
  const { authorId, title, content, tags = '' } = req.body;
  // const { authorId } = req.user;
  //need to pull the authorid from req.user
  const tagArr = tags.trim().split(/\s+/);
  const postData = { authorId, title, content, tags };
  const author = [user.id, user.username, user.name, user.location];

  //only sends tags if there are tags to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  try {
    postData.authorId = user.id;
    postData.author = author;
    // add authorId, title, content to postData object
    // const { authorId, title, content } = postData;
    console.log('postdata', postData);
    const post = await createPost(postData);
    // this will create the post and the tags for us

    // title and authorid and content aren't bing read #TODO

    // if the post comes back, res.send({ post });
    if (postData) {
      res.send({ post });
      // next();
    } else {
      next({ message });
    }
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});

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
      res.send({ post: updatedPost });
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
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
      next(
        post
          ? {
              name: 'UnauthorizedUserError',
              message: 'You cannot delete a post which is not yours',
            }
          : {
              name: 'PostNotFoundError',
              message: 'That post does not exist',
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// original
// postsRouter.get('/', async (req, res) => {
//   const posts = await getAllPosts();
//   res.send({
//     posts,
//   });
// });

postsRouter.get('/', async (req, res) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      // keep a post if it is either active, or if it belongs to the current user

      return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
