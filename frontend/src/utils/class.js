import instance from "./axios.js";

export const getClassesForTeacher = async () => {
    try {
        const response = await instance.get('/api/auth/teacher/classes');
        const data = response.data;
        // console.log(data);
        if(data != undefined && data != null) {
            return data;
        }
    } catch(error) {
        console.log("Error fetching classes: ", error);
    }
};