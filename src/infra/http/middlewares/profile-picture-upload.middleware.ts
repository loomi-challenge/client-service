import { Request, Response, NextFunction } from "express";
import multer from "multer";
import multerConfig from "../../config/multer";

export const profilePictureUpload = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer(multerConfig).single("profilePicture");
  
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.field) {
        return res.status(400).json({
          error: `Campo inesperado '${err.field}'. Certifique-se de enviar o arquivo com o nome do campo 'profilePicture'`,
          details: err.message
        });
      }
      return res.status(400).json({
        error: "Erro no upload do arquivo", 
        details: err.message
      });
    } else if (err) {
      return res.status(500).json({
        error: "Erro do servidor",
        details: err.message
      });
    }
    
    
    if (!req.file) {
      return res.status(400).json({
        error: "Nenhum arquivo enviado. Por favor, forneça um arquivo de foto de perfil com o nome do campo 'profilePicture'"
      });
    }
    
    req.body.profilePicture = req.file
    
    next();
  });
}; 