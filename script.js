// Simple frontend-only extractor using Tesseract.js and PDF.js
const fileInput = document.getElementById('fileInput');
const pickBtn = document.getElementById('pickBtn');
const dropzone = document.getElementById('dropzone');
const status = document.getElementById('status');
const resultSection = document.getElementById('result');
const extractedTextEl = document.getElementById('extractedText');
const suggestionsEl = document.getElementById('suggestions');

pickBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));

;['dragenter','dragover'].forEach(e => {
  dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.add('drag'); });
});
;['dragleave','drop'].forEach(e => {
  dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.remove('drag'); });
});
dropzone.addEventListener('drop', ev => {
  if (ev.dataTransfer.files && ev.dataTransfer.files.length) handleFiles(ev.dataTransfer.files);
});

async function handleFiles(files) {
  const file = files[0];
  if (!file) return;
  resetUI();
  setStatus(`Processing ${file.name} ...`);
  try {
    let text = '';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      text = await extractTextFromPDF(file);
    } else if (file.type.startsWith('image/') || /\.(png|jpe?g|bmp|tiff)$/i.test(file.name)) {
      text = await extractTextFromImage(file);
    } else {
      throw new Error('Unsupported file type. Upload a PDF or an image.');
    }
    extractedTextEl.textContent = text || '[No text found]';
    resultSection.hidden = false;
    showSuggestions(text);
    setStatus('Done');
  } catch (err) {
    console.error(err);
    setStatus('Error: ' + (err.message || err));
    alert('Failed to extract text: ' + (err.message || err));
  }
}

function setStatus(msg) {
  status.textContent = msg;
}

function resetUI() {
  setStatus('');
  extractedTextEl.textContent = '';
  suggestionsEl.innerHTML = '';
  resultSection.hidden = true;
}

/* -------- PDF extraction using PDF.js -------- */
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
  let fullText = '';
  for (let i=1; i<=pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n';
    setStatus(`Reading PDF: page ${i}/${pdf.numPages}`);
  }
  return fullText.trim();
}

/* -------- Image OCR using Tesseract.js -------- */
async function extractTextFromImage(file) {
  return new Promise((resolve, reject) => {
    const worker = Tesseract.createWorker({
      logger: m => {
        if (m.status === 'recognizing text') setStatus(`OCR: ${Math.round(m.progress*100)}%`);
      }
    });
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      resolve(text);
    })().catch(reject);
  });
}

/* -------- Engagement suggestions (small, readable rules) -------- */
function showSuggestions(text) {
  const suggestions = suggestImprovements(text);
  suggestionsEl.innerHTML = '';
  if (suggestions.length === 0) {
    suggestionsEl.innerHTML = '<li>No suggestions — nice post!</li>';
    return;
  }
  suggestions.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    suggestionsEl.appendChild(li);
  });
}

function suggestImprovements(text) {
  const s = [];
  const lower = (text || '').toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean).length;
  if (words < 20) s.push('Try writing slightly longer posts (20+ words) to increase engagement.');
  if (!/[?]/.test(lower)) s.push('Ask a question in the post to invite replies and interaction.');
  if (!/(call to action|cta|buy now|click here|learn more)/.test(lower)) s.push('Add a clear call-to-action (CTA), e.g., "Learn more" or "Sign up".');
  if (!/(#\w+)/.test(lower)) s.push('Use 1–2 relevant hashtags to improve discoverability.');
  if (lower.length > 500) s.push('Consider splitting very long text into threads or a linked article.');
  return s;
}
