import instance from "./axios.js";

/**
 * Get all classes for the logged in teacher
 * @returns {Promise} - Promise resolving to the teacher's classes
 */
export const getClassesForTeacher = async () => {
    try {
        const response = await instance.get('/api/auth/teacher/classes');
        const data = response.data;
        console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.log("Error fetching classes: ", error);
    }
};

/**
 * Fetch a single class by ID
 * @param {string} classId - The ID of the class to fetch
 * @returns {Promise} - Promise resolving to the class data
 */
export const fetchClassById = async (classId) => {
  try {
    const response = await instance.get(`/api/classes/${classId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Invite a student to a class by email
 * @param {string} classId - The ID of the class
 * @param {string} email - The email of the student to invite
 * @returns {Promise} - Promise resolving to the response data
 */
export const inviteStudentToClass = async (classId, email) => {
  try {
    const response = await instance.post(`/api/classes/${classId}/invite`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload materials to a class
 * @param {string} classId - The ID of the class
 * @param {FormData} formData - FormData containing the files to upload
 * @returns {Promise} - Promise resolving to the response data
 */
export const uploadClassMaterials = async (classId, formData) => {
  try {
    const response = await instance.post(`/api/classes/${classId}/upload-materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Download a material from a class
 * @param {string} classId - The ID of the class
 * @param {string} materialId - The ID of the material to download
 * @returns {Promise} - Promise resolving to the response data
 */
export const downloadClassMaterial = async (classId, materialId) => {
  try {
    const response = await instance.get(`/api/classes/${classId}/materials/${materialId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a student from a class
 * @param {string} classId - The ID of the class
 * @param {string} studentId - The ID of the student to remove
 * @returns {Promise} - Promise resolving to the response data
 */
export const removeStudentFromClass = async (classId, studentId) => {
  try {
    const response = await instance.delete(`/api/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a student invitation
 * @param {string} classId - The ID of the class
 * @param {string} email - The email of the invited student
 * @returns {Promise} - Promise resolving to the response data
 */
export const cancelStudentInvitation = async (classId, email) => {
  try {
    const response = await instance.delete(`/api/classes/${classId}/invites`, { data: { email } });
    return response.data;
  } catch (error) {
    throw error;
  }
};