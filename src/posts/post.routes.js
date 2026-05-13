import { Router } from 'express'
import { createPost, getAllPosts, getPostsById, reactToPost } from './post.controller.js'
import { createPostValidator, getPostValidator } from '../../middlewares/post-validator.js'
import { validateJWT } from '../../middlewares/jwt-verify.js'
import { authtenticatedLimiter, apiLimiter } from '../../middlewares/request-limit.js'

const router = Router()

router.post('/', createPostValidator, createPost)

router.get('/', apiLimiter, getAllPosts)

router.get('/:id', getPostValidator, getPostsById)

router.post('/:id/react', validateJWT, authtenticatedLimiter, reactToPost)

export default router
