
async function asyncFunc() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return 'done';
}
asyncFunc().then(result => {
  console.log('Result:', result);
  process.exit(0);
});
