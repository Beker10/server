import { check } from 'express-validator'
import { validarCampos } from './validate-values.js'
import { validateJWT } from './jwt-verify.js'
import { existePost } from '../helpers/db-validators.js'
import { authtenticatedLimiter, publicLimiter, apiLimiter } from "./request-limit.js";

export const createPostValidator = [
    validateJWT,
    authtenticatedLimiter,
    check('title', 'El título es obligatorio').not().isEmpty(),
    check('title', 'El título no debe de exceder los 100 caracteres').isLength({ max: 100}),
    check('content', 'El contenido es obligarotrio').not().isEmpty(),
    validarCampos 
];

export const getPostValidator = [
  apiLimiter,
  check("id", "El ID del post es obligatorio").not().isEmpty(),
  check("id", "El ID debe ser un ObjectId válido").isMongoId(),
  check("id").custom(existePost),
  validarCampos,
];