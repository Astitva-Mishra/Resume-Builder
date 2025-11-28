import Resume from "../models/resumeModel.js";

// Basic English stopwords to ignore when extracting keywords
const STOPWORDS = new Set([
  "the","and","for","with","that","this","from","your","have","will","into","about","able",
  "you","are","our","their","them","they","was","were","been","being","can","could","should",
  "would","to","of","in","on","at","by","as","an","a","is","it","we","us","or","if","but",
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOPWORDS.has(w));
};

const extractKeywords = (jobDescription) => {
  const tokens = tokenize(jobDescription);
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  // Pick top 25 frequent tokens as keywords
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);
};

const collectResumeText = (resume) => {
  const parts = [];
  const p = resume.profileInfo || {};
  const c = resume.contactInfo || {};
  const w = Array.isArray(resume.workExperience) ? resume.workExperience : [];
  const e = Array.isArray(resume.education) ? resume.education : [];
  const s = Array.isArray(resume.skills) ? resume.skills : [];
  const pr = Array.isArray(resume.projects) ? resume.projects : [];

  parts.push(p.fullName, p.designation, p.summary);
  parts.push(c.location, c.linkedin, c.github, c.website);
  w.forEach((x) => parts.push(x.company, x.role, x.description));
  e.forEach((x) => parts.push(x.degree, x.institution));
  s.forEach((x) => parts.push(x.name));
  pr.forEach((x) => parts.push(x.title, x.description));

  return tokenize(parts.filter(Boolean).join(" "));
};

export const evaluateATS = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const { jobDescription = "", resumeOverride } = req.body || {};

    let resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or unauthorized" });
    }
    // If client provided a fresh version of resume data, use it for scoring without persisting structure changes
    const resumeForEval = resumeOverride ? { ...resume.toObject(), ...resumeOverride } : resume.toObject();

    // 1) Extract keywords from JD
    const jdKeywords = extractKeywords(jobDescription);
    // 2) Tokenize resume content
    const resumeTokensArr = collectResumeText(resumeForEval);
    const resumeTokens = new Set(resumeTokensArr);

    // 3) Keyword coverage
    const matchedKeywords = jdKeywords.filter((kw) => resumeTokens.has(kw));
    const missingKeywords = jdKeywords.filter((kw) => !resumeTokens.has(kw));
    const coverage = jdKeywords.length ? matchedKeywords.length / jdKeywords.length : 0;

    // 4) Section completeness score
    const hasProfile = !!(resumeForEval.profileInfo?.fullName && resumeForEval.profileInfo?.summary);
    const hasContact = !!(resumeForEval.contactInfo?.email && resumeForEval.contactInfo?.phone);
    const hasWork = Array.isArray(resumeForEval.workExperience) && resumeForEval.workExperience.some((x) => x.company && x.role && x.description);
    const hasSkills = Array.isArray(resumeForEval.skills) && resumeForEval.skills.some((x) => x.name);
    const hasProjects = Array.isArray(resumeForEval.projects) && resumeForEval.projects.some((x) => x.title && x.description);
    const completeness = [hasProfile, hasContact, hasWork, hasSkills, hasProjects].filter(Boolean).length / 5;

    // 5) Heuristics for quality suggestions and additional scoring
    const workDescs = (resumeForEval.workExperience || []).map((x) => `${x.role || ''} ${x.company || ''} ${x.description || ''}`).join(' ');
    const projectsDescs = (resumeForEval.projects || []).map((x) => `${x.title || ''} ${x.description || ''}`).join(' ');
    const combinedText = [resumeForEval.profileInfo?.summary || '', workDescs, projectsDescs].join(' ');

    const ACTION_VERBS = new Set(["led","managed","built","developed","designed","implemented","optimized","improved","created","launched","owned","delivered","deployed","migrated","refactored","automated","architected","resolved","collaborated","analyzed"]);
    const tokensCombined = tokenize(combinedText);
    const actionVerbHits = tokensCombined.filter((t) => ACTION_VERBS.has(t)).length;
    const actionVerbRatio = tokensCombined.length ? actionVerbHits / tokensCombined.length : 0;

    const numberRegex = /(\b\d+(?:\.\d+)?\b|%)/g;
    const hasMetrics = numberRegex.test(combinedText);

    const linksPresent = !!(resumeForEval.contactInfo?.linkedin || resumeForEval.contactInfo?.github || resumeForEval.contactInfo?.website);
    const uniqueSkills = new Set((resumeForEval.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean).map((x) => x.toLowerCase()));
    const skillsRichness = Math.min(uniqueSkills.size / 15, 1); // cap richness at 15 distinct skills

    const summaryLength = (resumeForEval.profileInfo?.summary || '').trim().length;

    // 6) Suggestions assembly
    const suggestions = [];
    if (!hasProfile) suggestions.push('Add a professional summary with your full name.');
    if (summaryLength < 80) suggestions.push('Expand your summary to 80–200 characters highlighting strengths.');
    if (!hasContact) suggestions.push('Include an email and phone number in contact details.');
    if (!linksPresent) suggestions.push('Add LinkedIn/GitHub or portfolio links to contact details.');
    if (!hasWork) suggestions.push('Add at least one detailed work experience entry.');
    if (!hasSkills) suggestions.push('List core skills and tools relevant to your roles.');
    if (!hasProjects) suggestions.push('Add projects with short impact-driven descriptions.');
    if (!hasMetrics) suggestions.push('Quantify achievements (numbers, %, time saved, revenue, users).');
    if (actionVerbRatio < 0.01) suggestions.push('Use strong action verbs (led, built, optimized, delivered).');
    if (missingKeywords.length > 0) suggestions.push(`Consider adding missing role keywords: ${missingKeywords.slice(0,8).join(', ')}.`);
    if (uniqueSkills.size < 8) suggestions.push('Increase skills breadth to 8+ relevant items.');

    // 7) Weighted final score (0–100)
    const score = Math.round(
      coverage * 50 + // JD keyword coverage
      completeness * 25 + // core sections present
      skillsRichness * 10 + // skills diversity
      (hasMetrics ? 10 : 0) + // quantified achievements
      Math.min(actionVerbRatio * 100, 5) // action verbs presence (up to 5)
    );

    // Persist ATS info on the resume
    resume.ats = {
      score,
      matchedKeywords,
      missingKeywords,
      suggestions,
      lastEvaluatedAt: new Date(),
    };
    await resume.save();

    res.json({
      score,
      matchedKeywords,
      missingKeywords,
      keywordsAnalyzed: jdKeywords,
      suggestions,
    });
  } catch (err) {
    console.error("ATS evaluation error:", err);
    res.status(500).json({ message: "Failed to evaluate ATS score", error: err.message });
  }
};