const express = require('express');
const userRouter = express.Router();

const {
  register,
  login,
  profile,
  logout,
  update,
  deleteUser,
  checkRole,
} = require('../controllers/userController');

const authUser = require('../middleware/authUser');
const authAdmin = require('../middleware/authAdmin');

const upload = require('../middleware/upload'); // multer with memoryStorage
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// 📦 POST /api/user/signup
userRouter.post('/signup', register);

// 🔐 POST /api/user/login
userRouter.post('/login', login);

// 🚪 GET /api/user/logout
userRouter.get('/logout', logout);

// 👤 GET /api/user/profile
userRouter.get('/profile', authUser, profile);

// ✏️ PATCH /api/user/update
userRouter.patch('/update', authUser, update);

// ❌ DELETE /api/user/delete/:userId (Admin only)
userRouter.delete('/delete/:userId', authAdmin, deleteUser);

// 🧾 GET /api/user/check-role
userRouter.get('/check-role', authUser, checkRole);

// 📤 POST /api/user/upload (Cloudinary image upload)
userRouter.post('/upload', authUser, upload.single('file'), async (req, res) => {
  try {
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profile_pics' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = userRouter;
