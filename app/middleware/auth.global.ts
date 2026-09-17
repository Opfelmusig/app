export default defineNuxtRouteMiddleware(async (to) => {
  const { $profile } = useNuxtApp();

  if (to.path === "/login" && !!$profile.data) {
    return await navigateTo("/");
  }

  if (to.path !== "/login" && !$profile.data) {
    return await navigateTo("/login");
  }
});
