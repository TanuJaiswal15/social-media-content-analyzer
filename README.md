# Social Media Content Analyzer

I built this small app to extract text from PDFs and images (screenshots or scanned posts) and provide quick, actionable suggestions to improve engagement.

## Features
- Drag & drop or file picker for images and PDFs  
- In-browser OCR (Tesseract.js) and PDF parsing (PDF.js)  
- Loading/progress indicators and basic error handling  
- Simple rule-based engagement suggestions

## Run locally
1. `git clone <your-repo-url>`
2. Open `index.html` (or run `npx serve .`)

## Deployment
I deployed this as a static site (Vercel/Netlify are good choices).

## Attribution
This project was inspired by simonw/tools (https://github.com/simonw/tools). I reimplemented core ideas and added my own engagement-suggestion logic and UI changes.

## 200-word approach
I built the Social Media Content Analyzer as a compact, frontend-first solution so I could demo a working pipeline in under 8 hours. My focus was on real usability: users should be able to drop a screenshot or upload a PDF and immediately get usable text and suggestions. I used PDF.js to extract text from PDFs while preserving layout and Tesseract.js in the browser for OCR on image uploads, which keeps everything client-side and fast. To make the tool genuinely useful for social-media authors, I added a small rule-based analyzer that recommends CTAs, hashtag usage, and whether the post should ask a question — simple rules that are easy to explain in an interview. I prioritized clean, well-commented code, clear loading states for a better UX, and basic error handling so parsing failures are visible and actionable. Finally, I documented setup and deployment steps and included an attribution note to the inspiration repo.
