/**
 * chatbot service
 */

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  ConversationalRetrievalQAChain,
  LLMChain,
  loadQAChain,
} from 'langchain/chains';
import { JsonArray } from 'type-fest';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { Document } from '@langchain/core/documents';

function createGeminiLLM() {
  return new ChatVertexAI({
    model: 'gemini-1.0-pro',
    maxOutputTokens: 8192,
  });
}

async function populateVectorStore() {
  const products = await strapi.entityService.findMany('api::product.product', {
    limit: -1,
    populate: '*',
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });

  const productDocuments = products
    .map((p) => {
      const flatProduct = {
        id: p.id,
        name: p.name,
        description: p.description,
        brand: p.brand.name,
        category: p.category.name,
        price: `${p.price} USD`,
      };
      for (const spec of p.specifications) {
        if (typeof spec.value === 'boolean') {
          flatProduct[spec.name] = spec.value ? 'Yes' : 'No';
        } else {
          flatProduct[spec.name] = spec.value;
        }
      }
      for (const eco of p.eco_data) {
        if (eco.name === 'recycled_materials') {
          flatProduct[eco.name] = (eco.value as JsonArray).join(', ');
        } else if (typeof eco.value === 'boolean') {
          flatProduct[eco.name] = eco.value ? 'Yes' : 'No';
        } else if (eco.name === 'carbon_footprint') {
          flatProduct[eco.name] = `${eco.value} kg CO2`;
        } else {
          flatProduct[eco.name] = eco.value;
        }
      }
      return flatProduct;
    })
    .map((p) => {
      const pageContent = Object.entries(p)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      return new Document({
        pageContent,
        metadata: {
          source: `product[${p.id}]`,
        },
      });
    });

  return await MemoryVectorStore.fromDocuments(productDocuments, embeddings);
}

async function answerFromVectorStore(
  input: string,
  chatHistory: (HumanMessage | AIMessage)[],
) {
  const vectorStore = await populateVectorStore();
  const retriever = vectorStore.asRetriever();

  const question_prompt = ChatPromptTemplate.fromTemplate(
    `Given the following chat history and a follow up question, rephrase the follow up input question to be a standalone question.
Or end the conversation if it seems like it's done.

Chat History:
{chat_history}

Follow Up Input:
{question}

Standalone question:`,
  );

  const question_generator = new LLMChain({
    llm: createGeminiLLM(),
    prompt: question_prompt,
  });

  const qa_prompt = ChatPromptTemplate.fromTemplate(
    `You are a friendly, conversational retail shopping negotiation assistant of a electronic store which sells TV, lighting, audio products, washing machine, etc. Your name is EcoSpark.
Use the following context including product names, descriptions, category, brand, price, specification, eco data to show the shopper whats available, answer their question
and negotiate with them to help them find the best product for their needs. Remember to provide good options and help them choose the optimal eco-friendly product if possible.
Please be friendly like a sweet sale girl and make sure to provide CORRECT product name, category, brand, price, specification, eco data, etc.
If you're referring to a product, please also append (product_id:id) to the product name.

Context:
{context}

Question:
{question}

Helpful Answer:`,
  );
  const doc_chain = loadQAChain(createGeminiLLM(), {
    prompt: qa_prompt,
    type: 'stuff',
  });

  const chatbot = new ConversationalRetrievalQAChain({
    retriever,
    combineDocumentsChain: doc_chain,
    questionGeneratorChain: question_generator,
  });

  return await chatbot.invoke({
    chat_history: chatHistory.map((record) => record),
    question: input,
  });
}

async function getProductsByIds(ids: number[]) {
  return await strapi.entityService.findMany('api::product.product', {
    filters: {
      id: {
        $in: ids,
      },
    },
    populate: '*',
  });
}

export default () => ({
  async processMessage(
    clientId: string,
    message: string,
    chatHistory: Array<{
      message: string;
      role: string;
    }>,
  ) {
    const history =
      chatHistory.length === 0
        ? [new AIMessage('Hello! Which product are you looking for today?')]
        : chatHistory.map((record) => {
          return record.role === 'user'
            ? new HumanMessage(record.message)
            : new AIMessage(record.message);
        });
    const response = await answerFromVectorStore(message, history);
    return response.text;
  },

  async extractProductsFromResponse(response: string) {
    const productIdHints = response.matchAll(/\s?\(product[_ ]id:\s*(?<product_id>\d+)\)/g);
    const productIds: number[] = [];
    for (const match of productIdHints) {
      const productId = match.groups!.product_id;
      // replace that matched string with empty string
      response = response.replace(match[0], '');
      productIds.push(parseInt(productId));
    }
    const uniqueProductIds = [...new Set(productIds)];
    const products = await getProductsByIds(uniqueProductIds);

    return { message: response, products };
  },
});
