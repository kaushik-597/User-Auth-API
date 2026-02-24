import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found !!");
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the refresh and access tokens !!",
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  //validation
  if (!email) throw new ApiError(400, "Email is required !!");

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found !!");
  }

  //validate the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect... Try Again :(");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "Logged In successfully ;)"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //validation
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists !!");
  }

  //now the logic to take the images from the request
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  //uploading the avatar image on cloudinary (like literally callin the method and passing the filepath as args)
  // if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");
  // const avatar = await uploadOnCloudinary(avatarLocalPath);

  let avatar;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new ApiError(500, "Failed to upload avatar :(");
  }

  //doing the same with the coverimage but if its not there then
  //let the coverimage be an empty string cuz it aint much required
  // let coverImage = "";
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  let coverImage = "";

  if (coverLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverLocalPath);
    } catch {
      throw new ApiError(500, "Cover image upload failed :(");
    }
  }

  //now creating a user object in mongo
  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage.url || "",
      username: username.toLowerCase(),
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while creating the user :(",
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdUser, "User registered successfully :D"),
      );
  } catch (error) {
    console.log("User registration failed... ");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while creating the user and images were deleted :D",
    );
  }
});

//refreshing the tokens -- "refreshToken, accessToken" by getting the tokens from "req.cookies",
//if no token found throw error or we verify this incoming token using jwt.verify
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;
  if (!incomingToken) {
    throw new ApiError(401, "Refresh Token is Required !!");
  }

  //storing the verified token into a new variable
  //also this method doesnt interact with DB or anything... basically the jwt only checks the format/structure
  //of the token as if it contains the payload(usually id), the secret same as of .env and then expiry
  //here the payload's presence matters meaning the id can be any random id doesnt matter if it exists in the
  //DB, it just has to be in the correct format/structure
  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    //since this token consists the user id we can make a query in the DB by accesssing the id
    //if the token's id doesnt match any user in the DB then throw error
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token !!");

    //this "if case" makes sure the incoming token is up-to-date or latest i.e. it can be a dead-token/an old token
    //which is expired so we compare it from the one in DB which is always correct unless changed by any external factors
    if (incomingToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    //making new tokens -- both refresh and access
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user._id,
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed Successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Something went wrong refreshing access token");
  }
});

//this is the controller logic for logout functionality that literally sets the refreshToken to
// undefined/""/null cuz if no refreshToken exists then user cant stay loggedIn, also it doesnt change the prev
//value instead of that it deletes the prev one and creates a new one
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully !!"));
});

export { logOutUser, loginUser, refreshAccessToken, registerUser };
