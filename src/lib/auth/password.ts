export function validatePasswordStrength(password: string) {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve ter pelo menos 1 letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve ter pelo menos 1 letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "A senha deve ter pelo menos 1 número.";
  }

  return null;
}
