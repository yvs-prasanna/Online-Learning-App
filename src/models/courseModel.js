const database = require("../config/database")

const getCourses = async(conditions, params, sort) => {
    try{
        let coursesQuery = `select * from (courses inner join educators on courses.educator_id = educators.id) 
        as T inner join educator_subjects on T.educator_id = educator_subjects.educator_id `;

        if(conditions){
            coursesQuery += ` where `;
            coursesQuery += conditions;
        }

        if(sort){
            coursesQuery += ` order by ${sort};`
        }

        const courses = await database.query(coursesQuery, params);
        return courses;
    }catch(error){
        console.log(error);
        return null;
    }    
}

const getCourseById = async(id) => {
    try{
        const courseQuery = `select * from (courses inner join educators on courses.educator_id = educators.id) 
        as T inner join educator_subjects on T.educator_id = educator_subjects.educator_id where T.id = ?;`
        const syllabusQuery = `select * from lessons where course_id = ?;`
        const rows = await database.query(syllabusQuery, [id]);

        const syllabusMap = {};

        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins} mins${secs > 0 ? ` ${secs} secs` : ''}`;
        };

        rows.forEach(row => {
            if (!syllabusMap[row.title]) {
                syllabusMap[row.title] = [];
            }

            syllabusMap[row.title].push({
                        id: row.id,
                        title: row.title,
                        duration: formatDuration(row.duration_seconds),
                        isFree: !!row.is_free
                    });
            });

        const syllabus = Object.entries(syllabusMap).map(([chapter, lessons]) => ({
            chapter,
            lessons
        }));

        const course = await database.query(courseQuery, [id]);
        const educator = {
            id: course[0].educator_id,
            name: course[0].name,
            email: course[0].email,
            qualification: course[0].qualification,
            experience: course[0]["rating:1"]
        }
        const courseDetails = {
            id: course[0].id,
            title: course[0].title,
            description: course[0].description
        }

        const featureDetails = {
            features: course[0].features,
            validity: course[0].validity,
            price: course[0].price,
        }
    
        return {courseDetails, educator, syllabus, ...featureDetails};
    }catch(error){
        console.log(error);
        return null;
    }
}

module.exports = {
    getCourses,
    getCourseById
}