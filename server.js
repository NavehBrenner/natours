import app from './app.mjs';
// START SERVER
const APP_PORT = process.env.PORT || 8080;
app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});
