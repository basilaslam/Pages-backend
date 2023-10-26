import mongoose, { Document, Schema } from 'mongoose';

// Define the PDF file schema
const pdfSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileKey: {
    type: String,
    required: true,
    unique: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model for the user who uploaded the PDF
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields as needed, such as a reference to the selected pages, etc.
});

// Define the PDF model interface
export interface IPDF extends Document {
  originalName: string;
  uploadedBy: mongoose.Types.ObjectId; // Reference to the User model
  uploadedAt: Date;
  // Add more fields here if needed
}

// Create the PDF model
const PDF = mongoose.model<IPDF>('PDF', pdfSchema);
export default PDF;
