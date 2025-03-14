# AI Teacher Assistant

## 📌 Project Overview
An AI-powered teacher assistant that automates assignment grading and provides personalized feedback using Google Cloud services. The goal is to reduce the workload on educators and enhance student learning.

## 🚀 Tech Stack

| Component | Tech Used |
|-----------|-----------|
| **Frontend** | Next.js + Tailwind CSS |
| **Backend** | Node.js (Express) |
| **OCR (Handwriting Recognition)** | Google Cloud Vision API |
| **AI Grading (RAG Model)** | Vertex AI (PaLM 2) with Google Books API |
| **Database & Storage** | Firebase Firestore + Google Cloud Storage |
| **Authentication** | Firebase Auth (Google Sign-In) |
| **Analytics for Teachers** | Google Looker Studio (via BigQuery) |

## 📂 Project Setup

### 1️⃣ Clone the Repository
```bash
git clone <repository_url>
cd <repository_folder>
```

### 2️⃣ Install Dependencies
```bash
npx create-next-app@latest .
npm install firebase @google-cloud/storage @google-cloud/vision @headlessui/react @heroicons/react
```

### 3️⃣ Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see the app running.

## 📌 Features (MVP Roadmap)
- ✅ **Student uploads handwritten answers (PDF/Image)**
- ✅ **AI extracts text using Google Vision API**
- ✅ **AI grades answers using Vertex AI (PaLM 2)**
- ✅ **Personalized feedback is generated**
- ✅ **Teachers can review & override scores**
- ✅ **Looker Studio dashboard for analytics**

---
### ✨ Contributing
1. Fork the repository 📌
2. Create a new branch: `git checkout -b feature-name` ✨
3. Commit your changes: `git commit -m "Added feature X"` 🔧
4. Push to the branch: `git push origin feature-name` 🚀
5. Submit a pull request ✅

---

### 📧 Contact
For queries, feel free to reach out!

---

🔥 Let's build something amazing! 🚀

