import { Configuration, OpenAIApi } from "../../node_modules/openai";

export const generateTemplate = async (wish: string) => {
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: wish,
      max_tokens: 4000,
      // temperature: 0,
    });

    if (
      response &&
      response.data &&
      response.data.choices &&
      response.data.choices[0].text
    ) {
      return response.data.choices[0].text;
    } else {
      return "Failed!";
    }
  } catch (err) {
    console.log(err);
    return err as string;
  }
};
