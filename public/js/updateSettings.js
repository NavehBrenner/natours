import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/${type === 'data' ? 'updateMe' : 'updateMyPassword'}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Updated ${type} successfuly`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Somthing went worng');
  }
};

export { updateSettings };