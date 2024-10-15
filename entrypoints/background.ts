export default defineBackground(() => {
  console.log('Hello background Ji!', { id: browser.runtime.id });
});
