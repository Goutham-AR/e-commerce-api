import express from  "express";
import { createProduct, deleteListOfProducts, deleteProduct, getAllProduct, getSingleProduct, updateProduct, uploadImage } from "../controllers/productController";
import { authMiddleware, authorizePermission } from "../auth/authMiddleware";
import { MulterStorageType, setupMulter } from "../utils/fileIO";

export const productRouter = express.Router();

const upload = setupMulter(MulterStorageType.memory);

// public routes
productRouter.get("/", getAllProduct)
productRouter.get("/:id", getSingleProduct)

// productRouter.post("/uploadPhoto", uploadImage2);
// productRouter.get("/getPhoto/:id", getImage);

productRouter.post("/", authMiddleware, authorizePermission("admin"), createProduct);
productRouter.delete("/deleteMany", authMiddleware, authorizePermission("admin"), deleteListOfProducts);
productRouter.route("/:id")
             .patch(authMiddleware, authorizePermission("admin"), updateProduct)
             .delete(authMiddleware, authorizePermission("admin"), deleteProduct);
productRouter.post("/:id/uploadImage", authMiddleware,  authorizePermission("admin"), upload.single("image"), uploadImage);

