
import mongoose from 'mongoose';

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(
            'mongodb://127.0.0.1:27017/collegeDB'
        );

        console.log("MongoDB Connected Successfully!");


        // Define Student Schema
        const studentSchema = new mongoose.Schema({
            studentId: {
                type: String,
                required: true,
                unique: true
            },

            name: {
                type: String,
                required: true
            },

            course: {
                type: String,
                required: true
            },

            marks: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            }
        });

        // Create Student Model
        const Student = mongoose.model(
            "Student",
            studentSchema
        );

        console.log("Student Model Created Successfully!");

        // Insert one student
        const student = await Student.create({
            studentId: "S301",
            name: "Bidhya",
            course: "CSE",
            marks: 90
        });

        console.log("Student Saved Successfully!");
        console.log(student);

        // Read students with marks >= 80
        const result = await Student.find({
            marks: { $gte: 80 }
        });

        console.log("Students with marks >= 80:");
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected!");
    }
}

main();
