import '@babel/polyfill';
import { login, logout } from './login';
import displayMap from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// login form
document.querySelector('.form--login')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

// update user data form
document.querySelector('.form-user-data')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData();
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);

  updateSettings(form, 'data');
});

// update password form
document
  .querySelector('.form-user-password')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--update-password').innerHTML = 'updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, newPassword, newPasswordConfirm },
      'password',
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--update-password').innerHTML = 'save password';
  });

// logout button
document.querySelector('.nav__el--logout')?.addEventListener('click', logout);

// book tour button
document.getElementById('book-tour')?.addEventListener('click', (e) => {
  e.target.textContent = 'Processing...';
  const { tourid } = e.target.dataset;
  bookTour(tourid);
});
