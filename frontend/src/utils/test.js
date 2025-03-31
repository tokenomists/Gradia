import instance from "./axios";

export const getTestsForStudent = async () => {
    try {
        const response = await instance.get('/api/auth/student/tests');
        const data = response.data;
        console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.log("Error fetching tests: ", error);
    }
}

export const getTestsForTeacher = async () => {
    try {
        const response = await instance.get('/api/tests/teacher-tests');
        const data = response.data;
        // console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.log("Error fetching tests: ", error);
    }
}

export const publishTest = async (updatedTestData) => {
    try {
        console.log(updatedTestData);
        const response = await instance.post('/api/tests/create-test', updatedTestData);
        const data = response.data;
        // console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.log("Error publishing test: ", error);
    }
}