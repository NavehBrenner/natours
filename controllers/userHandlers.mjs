const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: "this route isn't defined yet!",
  });
};

const getUserById = getAllUsers;
const createUser = getAllUsers;
const updateUser = getAllUsers;
const deleteUser = getAllUsers;

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
