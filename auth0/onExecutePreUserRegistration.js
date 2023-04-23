const { default: axios } = require('axios');

/**
 * Handler that will be called during the execution of a PreUserRegistration flow.
 *
 * @param {Event} event - Details about the context and user that is attempting to register.
 * @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the signup.
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  try {
    // Send requst to api hook to create a user in local db
    const response = await axios.post(
      'https://8147-222-153-30-222.ngrok-free.app/auth/create-user-hook',
      {
        username: event.user.username,
        name: event.user.name,
        email: event.user.email,
        secret: event.secrets.AUTH0_HOOK_SECRET,
      },
    );
    // Set user database id in Auth0 user metadata for accesstoken
    api.user.setUserMetadata('userId', response.data.userId);
  } catch (e) {
    if (e.response.status == 409) {
      api.access.deny('username_taken', 'Username taken');
      return;
    }
    if (e.response) {
      const error = e.response.data.error;
      if (error) {
        api.access.deny(error, error);
        return;
      }
    }
    api.access.deny(
      `Unknown error with status: ${e.response.status}`,
      'Something went wrong',
    );
  }
};
