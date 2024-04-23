import repl from 'node:repl';

const chatHistory = [
  {
    role: 'system',
    message: 'Hello! Which product are you looking for today?'
  }
];

const processUserMessage = (userInput, _ctx, _filename, callback) => {
  fetch('http://localhost:1337/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: 'repl',
      chatHistory,
      message: userInput,
    }),
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    throw new Error('Error: ' + res.statusText);
  }).then(data => {
    chatHistory.push({
      role: 'user',
      message: userInput,
    });
    chatHistory.push({
      role: 'system',
      message: data.message,
    });
    console.log('AI > ' + data.message);
    callback();
  }).catch((err) => {
    console.error(err);
  });
};

process.stdout.write('AI > Hello! Which product are you looking for today?\n');
const r = repl.start({ prompt: 'User > ', eval: processUserMessage });
