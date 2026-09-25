export default defineNuxtRouteMiddleware(async (to) => {
  const { valid } = useAuth();

  if (to.path === "/login" && valid.value) {
    return await navigateTo("/");
  }

  if (to.path !== "/login" && !valid.value) {
    return await navigateTo("/login");
  }
});
