const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const cors = require('cors');

const User = require('./models/User');
const Recipe = require('./models/Recipe');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


     mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB successfully connected..."))
    .catch(err => console.log("DB Connection Error:", err));


app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Error Registering User" });
    }
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        res.json({ message: "Login Successful", name: user.name });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


app.post('/add-recipe', async (req, res) => {
    const { name, description } = req.body;

    try {
        const newRecipe = new Recipe({ name, description });
        await newRecipe.save();
        res.json({ message: "Recipe Added Successfully", recipe: newRecipe });
    } catch (error) {
        res.status(500).json({ error: "Error Adding Recipe" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  