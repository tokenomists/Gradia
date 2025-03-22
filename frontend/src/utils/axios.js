// src/utils/axios.js
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const instance = axios.create({
  baseURL: baseURL, 
  withCredentials: true
});

export default instance;