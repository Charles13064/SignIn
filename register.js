const form = document.querySelector('.auth-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmError = document.getElementById('confirmPasswordError');
const requirements = document.querySelectorAll('#passwordRequirements li');
const strengthLabel = document.querySelector('.strength-label span');
const meterFill = document.querySelector('.meter-fill');
const toggleButtons = document.querySelectorAll('.toggle-password');

const passwordRules = {
  length: {
    test: value => value.length >= 8,
    label: 'Minimum 8 characters'
  },
  uppercase: {
    test: value => /[A-Z]/.test(value),
    label: 'At least one uppercase letter'
  },
  lowercase: {
    test: value => /[a-z]/.test(value),
    label: 'At least one lowercase letter'
  },
  digit: {
    test: value => /[0-9]/.test(value),
    label: 'At least one number'
  },
  special: {
    test: value => /[!@#$%^&*(),.?"{}|<>\[\]\\/~`_+=;:-]/.test(value),
    label: 'At least one special character'
  }
};

function updateRequirementList(password) {
  const results = Object.entries(passwordRules).map(([key, rule]) => ({ key, valid: rule.test(password) }));

  requirements.forEach(item => {
    const key = item.dataset.criteria;
    const valid = results.find(result => result.key === key)?.valid;
    if (valid) {
      item.classList.add('valid');
      item.querySelector('.requirement-icon').textContent = '✔';
    } else {
      item.classList.remove('valid');
      item.querySelector('.requirement-icon').textContent = '✖';
    }
  });

  const passedCount = results.filter(result => result.valid).length;
  const strength = passedCount <= 2 ? 'Weak' : passedCount === 3 || passedCount === 4 ? 'Medium' : 'Strong';
  const width = (passedCount / Object.keys(passwordRules).length) * 200;

  strengthLabel.textContent = strength;
  meterFill.style.width = `${width}%`;
  meterFill.style.background = strength === 'Strong'
    ? 'linear-gradient(90deg, #34d399, #22c55e)'
    : strength === 'Medium'
      ? 'linear-gradient(90deg, #fbbf24, #f97316)'
      : 'linear-gradient(90deg, #f87171, #ef4444)';

  return passedCount === Object.keys(passwordRules).length;
}

function showError(input, message, errorElement) {
  input.classList.add('invalid');
  errorElement.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input, errorElement) {
  input.classList.remove('invalid');
  errorElement.textContent = '';
  input.removeAttribute('aria-invalid');
}

function validateName() {
  if (!nameInput.value.trim()) {
    showError(nameInput, 'Enter your full name.', nameError);
    return false;
  }

  clearError(nameInput, nameError);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) {
    showError(emailInput, 'Enter your email address.', emailError);
    return false;
  }

  if (!emailInput.checkValidity()) {
    showError(emailInput, 'Enter a valid email address.', emailError);
    return false;
  }

  clearError(emailInput, emailError);
  return true;
}

function validatePassword() {
  const passwordValue = passwordInput.value;
  const passwordIsValid = updateRequirementList(passwordValue);

  if (!passwordValue) {
    showError(passwordInput, 'Create a password to continue.', passwordError);
    return false;
  }

  if (!passwordIsValid) {
    showError(passwordInput, 'Password must meet all requirements.', passwordError);
    return false;
  }

  clearError(passwordInput, passwordError);
  return true;
}

function validateConfirmPassword() {
  const confirmValue = confirmInput.value;

  if (!confirmValue) {
    showError(confirmInput, 'Please confirm your password.', confirmError);
    return false;
  }

  if (confirmValue !== passwordInput.value) {
    showError(confirmInput, 'Passwords do not match.', confirmError);
    return false;
  }

  clearError(confirmInput, confirmError);
  return true;
}

function validateForm() {
  const validName = validateName();
  const validEmail = validateEmail();
  const validPassword = validatePassword();
  const validConfirm = validateConfirmPassword();

  return validName && validEmail && validPassword && validConfirm;
}

passwordInput.addEventListener('input', () => {
  updateRequirementList(passwordInput.value);
  validatePassword();
  if (confirmInput.value) {
    validateConfirmPassword();
  }
});

confirmInput.addEventListener('input', validateConfirmPassword);
nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);

const successModal = document.getElementById('successModal');
const validationModal = document.getElementById('validationModal');
const successPanel = successModal?.querySelector('.modal-panel');
const validationPanel = validationModal?.querySelector('.modal-panel');
const successClose = successModal?.querySelector('.modal-close');
const validationClose = validationModal?.querySelector('.modal-close');
const validationList = validationModal?.querySelector('.modal-list');
let lastFocusedElement = null;

function collectInvalidFields() {
  const invalid = [];
  if (!nameInput.value.trim()) invalid.push('Full name');
  if (!emailInput.value.trim() || !emailInput.checkValidity()) invalid.push('Valid email address');
  if (!passwordInput.value) invalid.push('Password');
  if (!confirmInput.value || confirmInput.value !== passwordInput.value) invalid.push('Matching confirm password');
  return invalid;
}

function openModal(modal, panel) {
  if (!modal || !panel) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  panel.focus();
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeyDown);
}

function closeModal(modal) {
  if (!modal) return;
  const panel = modal.querySelector('.modal-panel');
  if (panel) {
    panel.classList.add('closing');
    panel.addEventListener('animationend', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      panel.classList.remove('closing');
    }, { once: true });
  } else {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeyDown);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function showValidationModal(items) {
  if (!validationList) return;
  validationList.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  openModal(validationModal, validationPanel);
}

form.addEventListener('submit', event => {
  const valid = validateForm();
  if (!valid) {
    event.preventDefault();
    event.stopPropagation();
    const items = collectInvalidFields();
    showValidationModal(items.length ? items : ['Please complete all required fields.']);
    return;
  }

  event.preventDefault();
  showSuccessModal();
});

toggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const targetInput = document.getElementById(targetId);
    const isPassword = targetInput.type === 'password';

    targetInput.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
    button.setAttribute('aria-label', `${isPassword ? 'Hide' : 'Show'} ${targetInput.id === 'password' ? 'password' : 'confirm password'}`);
  });
});

function focusableElements(container) {
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled'));
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeModal(successModal);
    closeModal(validationModal);
    return;
  }

  if (event.key !== 'Tab') return;
  const activeModal = successModal.classList.contains('active') ? successModal : validationModal.classList.contains('active') ? validationModal : null;
  if (!activeModal) return;

  const panel = activeModal.querySelector('.modal-panel');
  const focusable = focusableElements(panel);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function showSuccessModal() {
  openModal(successModal, successPanel);
}

successClose?.addEventListener('click', () => closeModal(successModal));
validationClose?.addEventListener('click', () => closeModal(validationModal));

successModal?.addEventListener('click', event => {
  if (event.target === successModal) closeModal(successModal);
});
validationModal?.addEventListener('click', event => {
  if (event.target === validationModal) closeModal(validationModal);
});
