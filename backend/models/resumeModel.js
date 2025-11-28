import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    thumbnailLink: {
      type: String,
    },

    template: {
      theme: String,
      colorPalette: [String],
    },

    profileInfo: {
      profilePreviewUrl: String,
      fullName: String,
      designation: String,
      summary: String,
    },

    contactInfo: {
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
    },

    workExperience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],

    education: [
      {
        degree: String,
        institution: String,
        startDate: String,
        endDate: String,
      },
    ],

    skills: [
      {
        name: String,
        progress: Number,
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        github: String,
        liveDemo: String,
      },
    ],

    certifications: [
      {
        title: String,
        issuer: String,
        year: String,
      },
    ],

    language: [
      {
        name: String,
        progress: Number,
      },
    ],

  interests: [String],

    // ATS evaluation results
    ats: {
      score: { type: Number, default: 0 },
      matchedKeywords: [String],
      missingKeywords: [String],
      suggestions: [String],
      lastEvaluatedAt: Date,
    },
  },

  {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model("Resume", ResumeSchema);
