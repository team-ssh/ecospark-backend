/**
 * A set of functions called "actions" for `chatbot`
 */
import { Context } from 'koa';
import { array, assert, is, object, string } from 'superstruct';

export default {
  helloWorld: async (ctx: any) => {
    try {
      ctx.body = {
        message: 'Hello World',
      };
    } catch (err) {
      ctx.body = err;
    }
  },
  processMessage: async (ctx: Context) => {
    const RequestSchema = object({
      clientId: string(),
      message: string(),
      chatHistory: array(
        object({
          role: string(),
          message: string(),
        }),
      ),
    });

    if (!is(ctx.request.body, RequestSchema)) {
      return ctx.badRequest('malformed chatbot request');
    }

    try {
      const { clientId, message, chatHistory } = ctx.request.body;
      const chatbotService = strapi.service('api::chatbot.chatbot');
      const response = await chatbotService.processMessage(
        clientId,
        message,
        chatHistory,
      );
      ctx.body = {
        message: response,
      };
      return;
    } catch (e) {
      strapi.log.error(e);
      return ctx.internalServerError("I can't answer to that query right now.");
    }
  },
};
