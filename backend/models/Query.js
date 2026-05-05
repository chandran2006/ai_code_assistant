const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'java', 'typescript', 'c', 'cpp', 'go', 'rust'],
    },
    code:    { type: String, required: true, maxlength: 10000 },
    result: {
      bugs:                 String,
      fixedCode:            String,
      explanation:          String,
      optimization:         String,
      testCases:            String,
      score:                Number,
      timeComplexity:       String,
      spaceComplexity:      String,
      complexityComparison: String,
      realWorldImpact:      String,
      interviewMode:        String,
      roast:                String,
      badge:                String,
    },
    explainLike5:  { type: Boolean, default: false },
    roastMode:     { type: Boolean, default: false },
    interviewMode: { type: Boolean, default: false },
    processingTime: Number,
    cacheKey:      { type: String, index: true },
    ipAddress:      String,
  },
  { timestamps: true, bufferCommands: false }
);

querySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Query', querySchema);
