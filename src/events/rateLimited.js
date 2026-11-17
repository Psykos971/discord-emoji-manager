export default {
  name: 'rateLimited',
  rest: true,
  execute(info) {
    console.log(`Discord rate limit: waiting ${Math.ceil(info.timeToReset / 1000)}s (${info.route})`);
  },
};
