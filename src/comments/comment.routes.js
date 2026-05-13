import { Router } from "express";
import { createComment } from "./comment.controller.js";
import { createCommentValidator } from "../../middlewares/comment-validator.js";

const router = Router();

// Crear comentario
router.post("/", createCommentValidator, createComment);

export default router;