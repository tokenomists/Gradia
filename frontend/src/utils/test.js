import axiosInstance from './axios';

export const getTestsForStudent = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/student/tests');
    const data = response.data;

    if (!data || data === undefined) {
      console.log("Invalid data format:", data);
      return { upcomingTests: [], previousTests: [] };
    }

    const currDate = new Date(); // Local system time

    // Process upcoming tests
    data.upcomingTests = data.upcomingTests.map(test => {
      const startTime = new Date(test.startTime); // Convert to Date object

      if (isNaN(startTime.getTime())) {
        console.error("Invalid date format:", test.startTime);
        return test; // Keep original if date is invalid
      }

      return {
        ...test,
        status: startTime.getTime() < currDate.getTime() ? "ready" : "not-ready"
      };
    });

    // Sort the tests as in the second implementation
    data.upcomingTests.sort((a, b) => new Date(a.scheduledDate || a.startTime) - new Date(b.scheduledDate || b.startTime));
    
    if (data.previousTests) {
      data.previousTests.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.completedAt);
        const dateB = new Date(b.submittedAt || b.completedAt);
        return dateB - dateA; // Most recent first
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    return { upcomingTests: [], previousTests: [] };
  }
};

export const getSubmissionsForStudent = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/student/submissions');
        const data = response.data;
        return data;
    } catch(error) {
        console.log("Error fetching submissions!");
        return [];
    }
};

export const getSubmissionByTestId = async (testId) => {
    try {
        const response = await axiosInstance.get('/api/auth/student/submission/' + testId);
        const data = response.data;
        console.log(data);
        if (!data || data === undefined) {
            console.log("Invalid data format:", data);
            return [];
        }
        return data[0];
    } catch (error) {
        console.error('Error fetching submission:', error);
        return [];
    }
};

export const getTestsForTeacher = async () => {
  try {
    const response = await axiosInstance.get('/api/tests/teacher-tests');
    const data = response.data;
    
    if(data != undefined && data != null) {
      return data;
    }
    return null;
  } catch(error) {
    console.log("Error fetching tests: ", error);
    throw error;
  }
};

export const publishTest = async (updatedTestData) => {
  try {
    console.log(updatedTestData);
    const response = await axiosInstance.post('/api/tests/create-test', updatedTestData);
    const data = response.data;
    
    if(data != undefined && data != null) {
      return data;
    }
    return null;
  } catch(error) {
    console.log("Error publishing test: ", error);
    throw error;
  }
};

export const getTestById = async (testId) => {
  try {
    const response = await axiosInstance.get(`/api/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};

// Alias for getTestById to maintain compatibility with both naming conventions
export const getTestDetails = async (testId) => {
  return getTestById(testId);
};
  
export const submitTest = async (testId, submissionData) => {
  try {
    const response = await axiosInstance.post(`/api/tests/submit/${testId}`, submissionData);
    return response.data;
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
};