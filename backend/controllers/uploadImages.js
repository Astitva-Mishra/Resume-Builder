import fs from "fs";
import path from "path";
import Resume from "../models/resumeModel.js";
import upload from "../middleware/uploadMiddleware.js";

export const uploadResumeImages = async (req, res) => {
  try {
    //Configure multer to handle images
    upload.fields([{ name: "thumbnail" }, { name: "profileImage" }])(
      req,
      res,
      async (err) => {
        try {
          if (err) {
            return res
              .status(400)
              .json({ message: "File upload failed", error: err.message });
          }

          const resumeId = req.params.id;
          const resume = await Resume.findOne({
            _id: resumeId,
            userId: req.user._id,
          });

          if (!resume) {
            return res
              .status(404)
              .json({ message: "Resume not found or unauthorized" });
          }

          // Ensure nested object exists to avoid crash when setting its property
          if (!resume.profileInfo) {
            resume.profileInfo = {};
          }

          //Use process CWD to locate uploads folder
          const uploadsFolder = path.join(process.cwd(), "uploads");
          // Make sure uploads folder exists
          try { fs.mkdirSync(uploadsFolder, { recursive: true }); } catch {}
          const baseUrl = `${req.protocol}://${req.get("host")}`;

          const newThumbnail = req.files?.thumbnail?.[0];
          const newProfileImage = req.files?.profileImage?.[0];

          if (newThumbnail) {
            // Remove old thumbnail if present
            if (resume.thumbnailLink) {
              const oldThumbnail = path.join(
                uploadsFolder,
                path.basename(resume.thumbnailLink)
              );
              if (fs.existsSync(oldThumbnail)) {
                fs.unlinkSync(oldThumbnail);
              }
            }
            // Always set new thumbnail link
            resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
          }

          //Same for profile preview image
          if (newProfileImage) {
            if (resume.profileInfo?.profilePreviewUrl) {
              const oldProfile = path.join(
                uploadsFolder,
                path.basename(resume.profileInfo.profilePreviewUrl)
              );
              if (fs.existsSync(oldProfile)) {
                fs.unlinkSync(oldProfile);
              }
            }
            resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
          }

          await resume.save();
          res.status(200).json({
            message: "Images uploaded successfully",
            thumbnailLink: resume.thumbnailLink,
            profilePreviewUrl: resume.profileInfo?.profilePreviewUrl,
          });
        } catch (innerErr) {
          console.error("Upload images route error:", innerErr);
          res.status(500).json({ message: "Failed to process upload", error: innerErr.message });
        }
      }
    );
  } catch (err) {
    console.error("Error uploading images:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};