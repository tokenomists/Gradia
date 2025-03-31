// /frontend/src/utils/handleErrors.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { error, message } = req.body;
  
  // You could log errors here to your server or analytics
  console.error(`Client error: ${error}`, message);
  
  // You could also store errors in a database if needed
  
  return res.status(200).json({ success: true });
}