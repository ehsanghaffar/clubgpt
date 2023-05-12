// TODO: Finish it
import axios from "axios";
import { Conversation } from 'gpt-turbo';
import { Configuration, OpenAIApi } from "openai";
import { GetChannelMessagesResponse, Message } from "../interfaces/ClubHouses";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// TODO
let roomMessages: Message[] = []
let links: Message[] = []
let sendedMessage = []
let answerMessages = []
let doneMessages = []

interface FetchRoomMessagesProps {
  channelID: string
  channelUrl: string
}
// TODO
const fetchMessages = async ({ channelID, channelUrl }: FetchRoomMessagesProps): Promise<Message[] | any> => {
  try {
    const result = await axios(channelUrl, {
      method: "POST",
      data: {
        channel: channelID,
        order: 0,
      },
    });
    const messages: GetChannelMessagesResponse = result.data;
    const findedLinks = messages.messages.filter((message) => {
      message.message.startsWith("http")
    });
    links.push(...findedLinks)
    const findedQuestions = messages.messages.filter((m) =>
      m.message.startsWith("#")
    );
    roomMessages.push(...findedQuestions)
    return findedQuestions
  } catch (error) {
    console.log(error);
  }
};
// TODOs
const sendToChatGPT = async (prompt: string) => {
  const conversation = new Conversation({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await conversation.prompt(prompt);
  return response
}