import instance from "./axios";

export const getTestsForStudent = async () => {
    try {
        const response = await instance.get('/api/auth/student/tests');
        const data = response.data;

        if (!data || data === undefined) {
            console.log("Invalid data format:", data);
            return [];
        }

        const currDate = new Date(); // Local system time

        data.upcomingTests = data.upcomingTests.map(test => {
            const startTime = new Date(test.startTime); // Convert to Date object

            if (isNaN(startTime.getTime())) {
                console.error("Invalid date format:", test.startTime);
                return test; // Keep original if date is invalid
            }
            // console.log({...test,
            //     status: startTime.getTime() < currDate.getTime() ? "ready" : "not-ready"});
            // console.log("Start time: ",startTime);
            // console.log("Current time: ",currDate);
            return {
                ...test,
                status: startTime.getTime() < currDate.getTime() ? "ready" : "not-ready"
            };
        });

        return data;
    } catch (error) {
        console.error("Error fetching tests:", error);
        return [];
    }
};

export const getSubmissionsForStudent = async () => {
    try {
        const response = await instance.get('/api/auth/student/submissions');
        const data = response.data;
        return data;
    } catch(error) {
        console.error("Error fetching submissions!");
        return [];
    }
}

export const getSubmissionByTestId = async (testId) => {
    try {
        const response = await instance.get('/api/auth/student/submission/' + testId);
        const data = response.data;
        // console.log(data);
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
        const response = await instance.get('/api/tests/teacher-tests');
        const data = response.data;
        // console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.error("Error fetching tests: ", error);
    }
}

export const publishTest = async (updatedTestData) => {
    try {
        // console.log(updatedTestData);
        const response = await instance.post('/api/tests/create-test', updatedTestData);
        const data = response.data;
        // console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.error("Error publishing test: ", error);
    }
}

export const getTestById = async (testId) => {
    try {
        const response = await instance.get(`/api/tests/${testId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching test:', error);
        throw error;
    }
};
  
export const submitTest = async (testId, submissionData) => {
    try {
        const response = await instance.post(`/api/tests/submit/${testId}`, submissionData);
        return response.data;
    } catch (error) {
        console.error('Error submitting test:', error);
        throw error;
    }
};