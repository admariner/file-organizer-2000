import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

const DEFAULT_MODEL = "gpt-4o";

const models = {
  "gpt-4o": createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })("gpt-4o"),
  "gpt-4o-2024-08-06": createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })("gpt-4o-2024-08-06"),
  "gpt-4o-mini": createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })("gpt-4o-mini"),
  "claude-3-5-sonnet-20240620": createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })("claude-3-5-sonnet-20240620"),
  "claude-3-5-sonnet-20241022": createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })("claude-3-5-sonnet-20241022"),
  "claude-3-5-haiku-20241022": createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })("claude-3-5-haiku-20241022"),
  "gemini-2.0-flash-exp": createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  })("gemini-2.0-flash-exp", {
    useSearchGrounding: true,
  }),

  "gemini-1.5-pro-search": createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  })("gemini-1.5-pro"),
  // bedrock
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        // Llama Models
        "llama-3-3-70b": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("meta.llama3-3-70b-instruct-v1:0"),
        "llama-3-2-90b": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("meta.llama3-2-90b-instruct-v1:0"),
        // Mistral Models
        "mistral-large": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("mistral.mistral-large-2407-v1:0"),
        "mixtral-8x7b": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("mistral.mixtral-8x7b-instruct-v0:1"),
        // Anthropic Models
        "anthropic.claude-3-5-sonnet-20240620-v1:0": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("anthropic.claude-3-5-sonnet-20240620-v1:0"),
        "anthropic.claude-3-5-haiku-20241022-v1:0": createAmazonBedrock({
          region: process.env.AWS_REGION || "us-west-2",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })("anthropic.claude-3-5-haiku-20241022-v1:0"),
      }
    : {}),
};

export const getModel = (name: string) => {
  if (!models[name]) {
    console.log(`Model ${name} not found`);
    console.log(`Defaulting to ${DEFAULT_MODEL}`);
    return models[DEFAULT_MODEL];
  }
  console.log(`Using model ${name}`);

  return models[name];
};

export const getAvailableModels = () => {
  return Object.keys(models);
};
