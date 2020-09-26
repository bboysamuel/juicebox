const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// set the req.user

apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    // IF: The Authorization header wasn't set. This might happen with registration or login, or when the browser doesn't have a saved token. Regardless of why, there is no way we can set a user if their data isn't passed to us.
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    // ELSE IF: It was set, and begins with Bearer followed by a space. If so, we'll read the token and try to decrypt it. a. On successful verify, try to read the user from the database b. A failed verify throws an error, which we catch in the catch block. We read the name and message on the error and pass it to next().

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
    // ELSE: A user set the header, but it wasn't formed correctly. We send a name and message to next()

    // so in one case we might add a key to the req object, and in two of the cases we might pass an error object to next.
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log('user is set', req.user);
  }

  next();
});

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send(error);
  // error handeler goes at the bottom of the page after all api routers but before module exports
});

module.exports = apiRouter;
