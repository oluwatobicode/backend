const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// so we are going to create a multerStorage and a multerFilter, that would help
// tp create and then upload the file from there,

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   }, // this is a callback fucntion, it is like the next function that we have in express

//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]; /* this is for the extensuon */
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage(); //THIS WOULD MAKE THE IMAGE BE STORED AS A BUFFER

// this os a multer filyter to check what type of image file was loaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images!'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedField) => {
  const newObject = {};

  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObject[el] = obj[el];
  });

  return newObject;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user posts password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates', 400));
  }

  // 2) UPDATE USER DOCUMENT

  // in here .save() method would not work because of the data we are using
  // the reason why we put x is that we do not update everything here
  const filteredBody = filterObj(req.body, 'name', 'email'); // we are filtering the rest and keeping the rest here
  if (req.file) filteredBody.photo = req.file.filename; // all we are doing here is to add the photo property to the object that is going to be updated in the filteredBody and the photo-propty is equal to the file's filename

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT UPDATE PASSWORDS WITH THIS
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
