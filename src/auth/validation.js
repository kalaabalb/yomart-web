const EMAIL_PATTERN = /^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/;

export function validateLogin({ identifier = '', password = '' }) {
  const errors = {};
  if (!identifier.trim()) errors.identifier = 'Enter your username or email.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateRegistration({ name = '', email = '', password = '', confirmPassword = '' }) {
  const errors = {};
  const username = name.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) errors.name = 'Use 3–32 letters, numbers, dots, dashes, or underscores.';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.password = 'Use at least 8 characters with upper and lowercase letters, a number, and a symbol.';
  }
  if (confirmPassword !== password) errors.confirmPassword = 'The passwords do not match.';
  return errors;
}
