import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/users.model.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import multer from "multer";

const router = Router();

// Multer setup for file upload
const storage = multer.memoryStorage(); // atau bisa disesuaikan kalau mau ke disk
const upload = multer({ storage: storage });

// Local login
router.post("/login", passport.authenticate("local", {
    failureMessage: true,
    session: false
}), (req, res) => {
    let token = null;
    if (req.user) {
        const _id = req.user._id;
        const payload = { _id };
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    }
    res.cookie("token", token);
    res.json({ message: 'login success!' });
});

// Logout
router.post("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ message: 'logout!' });
        });
    });
});

// Nodemailer transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "emmyrahmania@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});

// Send Email
router.post("/send-email", async (req, res) => {
    const { to, subject, text } = req.body;
    try {
        await transporter.sendMail({
            from: "emmyrahmania@gmail.com",
            to,
            subject,
            text
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Google login
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/login/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        let token = null;
        if (req.user) {
            const _id = req.user._id;
            const payload = { _id };
            token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
        }
        res.cookie("token", token);
        res.json({ message: 'login success!' });
    }
);

export default router;

