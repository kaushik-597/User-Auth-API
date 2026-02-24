//i made the models in eraser.io so now im just gonna use them as reference for
// makin the model here

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//creating instance of the Schema for user
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    avatar: {
      type: String, //Cloud URL
      required: true,
    },

    coverImage: {
      type: String,
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

//encrypting the password using a pre-hook i.e. save
//the hooks in mongo always take a function as params which further takes a middleware (next) as params so
//that we can pass the data to the next middleware as written in the last second line of pre-hook i.e. next()
userSchema.pre("save", async function () {
  //making a condition so that the password dont get hashed everytime when entered
  //it only changes when the password itself gets modified
  if (!this.isModified("password")) return;

  //using bcrypt to hash the password upto 10 rounds
  this.password = await bcrypt.hash(this.password, 10);
});

//comparing the password so that the pass entered by the user can be matched with the one
//stored in the DB to ensure the correct login creteria

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//method to generate the json access tokens i.e. short lived tokens
//these include payload(object), secret(string), expiry(time - can be in h or d)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

//method to generate the json refresh tokens i.e. long lived tokens
//these include payload(object), secret(string), expiry(time - can be in h or d)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

//exporting Users as returned by the model method of the mongoose
//which takes two params i.e. name of the model and instance for the model structure
export const User = mongoose.model("User", userSchema);
