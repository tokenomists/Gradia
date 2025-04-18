# Gradia
Gradia is an AI powered grading tool designed to help teachers evaluate student answers quickly and fairly. It uses Retrieval Augmented Generation (RAG) to match answers with the uploaded course material and grade responses accordingly - no random AI hallucinations, just grounded grading. It also provides students with helpful feedback and citations, so they know what they did right, what went wrong, and how to improve next time.

## Problem We Aim to Solve
Grading is tough, especially with large batches, and teachers are already overburdened. Most of the time, students don't get any feedback, and everything just ends up as a mark with no explanation. Most tools today either miss the context or don't explain how they arrived at a score. That’s why Gradia was built—to automate the process while ensuring it’s accurate, explainable, and grounded in the material teachers actually use.

## Installation
For setup instructions, refer to [INSTALLATION.md](INSTALLATION.md)

## Key Features
- **RAG based grading with feedback and citations**  
  - Gradia uses Retrieval Augmented Generation (RAG) to match answers with the course material. 
  - It provides feedback that helps students understand what they did right or wrong, based on the actual syllabus. 
  - It also includes citations, showing exactly which parts of the material were used to justify the grade. 
  - This ensures grading is accurate, grounded in the taught content, and free from AI hallucinations.

- **Code Evaluation using Judge0**  
  For coding questions, Gradia integrates with Judge0 to run submitted code against test cases. It checks the output for accuracy and supports multiple programming languages, making it flexible for a variety of coding questions.

- **Handwritten Answer Support**  
  Students can upload photos of scanned handwritten answers, and Gradia uses Cloud Vision OCR to extract the text. The system then processes the extracted text through the RAG grading pipeline, treating it the same way as typed responses.

- **Performance Analytics**  
  - Gradia provides detailed feedback for each student’s response, highlighting areas for improvement. It also includes a performance chart so that students can track their progress. 
  - For teachers, Gradia generates a heatmap showing class wide performance trends across all tests, helping identify areas where students may need more focus or improvement.

## Contributors
- Adithya Menon R
- Aashiq Edavalapati
- Narain BK
- Midhunan Vijendra Prabhaharan

## License
[LICENSE](LICENSE)
