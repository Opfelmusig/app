export default defineNuxtRouteMiddleware(async (to) => {
  if (useError().value) return;

  const { valid } = useAuth();

  if (to.path === "/login" && valid.value) {
    return await navigateTo("/");
  }

  if (to.path !== "/login" && !valid.value) {
    return await navigateTo("/login");
  }
});
