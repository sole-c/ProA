const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const forgotPasswordButton = document.querySelector("#forgot-password");
const formMessage = document.querySelector("#form-message");

passwordToggle.addEventListener("click", () => {
  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
  passwordToggle.setAttribute(
    "aria-label",
    shouldShowPassword ? "Ocultar contraseña" : "Mostrar contraseña"
  );
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent =
    "El formulario está listo para conectar con el sistema de autenticación.";
});

forgotPasswordButton.addEventListener("click", () => {
  formMessage.textContent =
    "La recuperación de contraseña estará disponible cuando se conecte el sistema.";
});

loginForm.addEventListener("input", () => {
  formMessage.textContent = "";
});
