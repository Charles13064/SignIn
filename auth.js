const authForm = document.querySelector('.auth-form');
const pageType = document.body.dataset.page || 'signin';
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const validationModal = document.getElementById('validationModal');
const resetSuccessModal = document.getElementById('resetSuccessModal');
const successModal = document.getElementById('successModal');
const modalCloseButtons = document.querySelectorAll('.modal-close');
let lastFocusedElement = null;

function showInlineError(input, errorElement, message) {
  if (!input || !errorElement) return;
  input.classList.add('invalid');
  errorElement.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearInlineError(input, errorElement) {
  if (!input || !errorElement) return;
  input.classList.remove('invalid');
  errorElement.textContent = '';
  input.removeAttribute('aria-invalid');
}

function validateEmail() {
  if (!emailInput) return false;
  const value = emailInput.value.trim();
  if (!value) {
    showInlineError(emailInput, emailError, 'Enter your email address.');
    return false;
  }
  if (!emailInput.checkValidity()) {
    showInlineError(emailInput, emailError, 'Enter a valid email address.');
    return false;
  }
  clearInlineError(emailInput, emailError);
  return true;
}

function validatePassword() {
  if (!passwordInput) return true;
  if (!passwordInput.value.trim()) {
    showInlineError(passwordInput, passwordError, 'Enter your password.');
    return false;
  }
  clearInlineError(passwordInput, passwordError);
  return true;
}

function collectMissingFields() {
  const missing = [];
  if (!emailInput || !validateEmail()) missing.push('Email address');
  if (pageType === 'signin' && (!passwordInput || !validatePassword())) missing.push('Password');
  return [...new Set(missing)];
}

function openModal(modal) {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  const panel = modal.querySelector('.modal-panel');
  panel?.focus();
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

function showValidationModal(missingFields) {
  if (!validationModal) return;
  const listContainer = validationModal.querySelector('.modal-list');
  if (listContainer) {
    listContainer.innerHTML = missingFields.length
      ? missingFields.map(item => `<li>${item}</li>`).join('')
      : '<li>Please fill in the required fields.</li>';
  }
  openModal(validationModal);
}

function showSignInSuccess() {
  if (!successModal) return;
  const message = successModal.querySelector('.modal-message');
  if (message) message.textContent = 'You are now signed in successfully.';
  openModal(successModal);
}

function showResetSuccess() {
  if (!resetSuccessModal) return;
  openModal(resetSuccessModal);
  setTimeout(() => {
    closeModal(resetSuccessModal);
    window.location.href = 'index.html';
  }, 4200);
}

function setButtonLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = 'Sending...';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

function handleSubmit(event) {
  if (!authForm) return;
  event.preventDefault();
  const validEmail = validateEmail();
  const validPassword = pageType === 'signin' ? validatePassword() : true;

  if (!validEmail || !validPassword) {
    showValidationModal(collectMissingFields());
    return;
  }

  if (pageType === 'reset') {
    const submitButton = authForm.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    setTimeout(() => {
      setButtonLoading(submitButton, false);
      showResetSuccess();
    }, 1200);
    return;
  }

  showSignInSuccess();
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeModal(validationModal);
    closeModal(resetSuccessModal);
    closeModal(successModal);
    return;
  }
  if (event.key !== 'Tab') return;

  const activeModal = [validationModal, resetSuccessModal, successModal].find(modal => modal?.classList.contains('active'));
  if (!activeModal) return;
  const panel = activeModal.querySelector('.modal-panel');
  const focusable = Array.from(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled'));
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

modalCloseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal-overlay');
    closeModal(modal);
    if (modal === resetSuccessModal) {
      window.location.href = 'index.html';
    }
  });
});

[validationModal, resetSuccessModal, successModal].forEach(modal => {
  modal?.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal(modal);
      if (modal === resetSuccessModal) {
        window.location.href = 'index.html';
      }
    }
  });
});

authForm?.addEventListener('submit', handleSubmit);

emailInput?.addEventListener('input', () => clearInlineError(emailInput, emailError));
passwordInput?.addEventListener('input', () => clearInlineError(passwordInput, passwordError));