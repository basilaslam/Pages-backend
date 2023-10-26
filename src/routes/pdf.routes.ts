import { Router } from "express";
import { getPDFs, saveUploadedFile, getPDF, editPDF, getEditedPDF } from "../controllers/pdf.controller";
import { verifyJWT } from "../middlewares/auth.middleware";


const router: Router = Router()

router.route("/").get(verifyJWT,getPDFs).post(verifyJWT,saveUploadedFile)
router.route("/:id").get(verifyJWT, getPDF)
router.route("/edit").post(verifyJWT, editPDF)
router.route("/edit/:name").get(getEditedPDF)


export default router