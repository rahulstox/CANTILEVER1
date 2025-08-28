const User = require("../models/user");

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Prepare update fields
        const updateData = { name };
        if (email) updateData.email = email;

        // Handle profile picture (if file uploaded or URL passed)
        if (req.file) {
            updateData.picture = `/uploads/${req.file.filename}`;
        } else if (req.body.picture) {
            updateData.picture = req.body.picture;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { updateProfile };
