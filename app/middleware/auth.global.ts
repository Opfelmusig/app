export default defineNuxtRouteMiddleware(async (to) => {
  const { $profile } = useNuxtApp();

  if (to.path === "/login" && !!$profile.data.value) {
    return await navigateTo("/");
  }

  if (to.path !== "/login" && !$profile.data.value) {
    return await navigateTo("/login");
  }
});
