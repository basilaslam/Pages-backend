import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import PDFmodal, { IPDF } from "../models/pdf.model";
import { IUser } from "../models/user.model";
import { PDFDocument } from 'pdf-lib'
import fs from 'fs/promises'
import axios from "axios";
import path from "path";


export const getPDFs = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const page: number = parseInt(req.query.page as string) || 1; // Current page number, default is 1
    const perPage: number = parseInt(req.query.perPage as string) || 10; // Number of items per page, default is 10

    try {
        const totalProducts = await PDFmodal.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);
        const user = req.user as IUser

        const products: IPDF[] = await PDFmodal.find({uploadedBy: user._id})
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.json({
            products,
            page,
            totalPages,
            totalProducts,
        });
    } catch (error) {
        next(error);
    }
});
export const getPDF = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pdf: string = req.params.id

    if(!pdf){
        throw new Error("No Id Found")
    }
    try {
        const pdfData: IPDF = await PDFmodal.findOne({fileKey: pdf}) as IPDF
        
        res.json({
            pdfData
        });
    } catch (error) {
        next(error);
    }
});


export const saveUploadedFile = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const user = req.user as IUser
            const { fileName, fileKey, fileUrl } = req.body
            
    PDFmodal.create({
        fileName,
        fileKey,
        fileUrl,
        uploadedBy: user._id
    })
    res.json({ message: 'File uploaded successfully!' }); 
})


export const editPDF = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    
    const { pages, url } = req.body
    
    const joinPDFPages = async () => {
        
        try {
          // Download the PDF from the URL
          const response = await axios.get(url, {
            responseType: 'arraybuffer',
          });
      
          // Load the PDF document
          const pdfDoc = await PDFDocument.load(response.data);
      
          // Create a new PDF document for the joined pages
          const newPdfDoc = await PDFDocument.create();
      
          // Iterate through the page numbers and add them to the new document
          for (const pageNumber of pages) {
            if (pageNumber >= 1 && pageNumber <= pdfDoc.getPageCount()) {
              const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
              newPdfDoc.addPage(page);
            } else {
              throw new Error(`Page ${pageNumber} does not exist in the input PDF.`)
            }
          }
      
          // Serialize the new PDF document
          const pdfBytes = await newPdfDoc.save();
      
          // Write the joined PDF to an output file
          await fs.writeFile(`public/pdfs/output.pdf`, pdfBytes);
          
          res.json({ url: `https://${req.get('host')}${req.originalUrl}/output.pdf`});

        } catch (error) {
          console.error('Error:', error);
        }
      };

      joinPDFPages()
})

export const getEditedPDF = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const pdfName = req.params.name;
    
    const file = path.join('public/pdfs', pdfName);
    console.log(file)
  
    res.download(file, pdfName, (err) => {
      if (err) {
        console.log(err)
        res.status(404).send('File not found');
      }
    });

})

