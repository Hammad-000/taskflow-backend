
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { signupSchema } from "../validations/auth.validation.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { name, email, password } = validation.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const validation = signupSchema
      .pick({
        email: true,
        password: true,
      })
      .safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password format",
        errors: validation.error.issues,
      });
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString());

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGOUT
export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
