export default {
  routes: [
    {
      method: 'POST',
      path: '/chatbot',
      handler: 'chatbot.processMessage',
    },
    {
      method: 'GET',
      path: '/chatbot',
      handler: 'chatbot.helloWorld',
    },
  ],
};
