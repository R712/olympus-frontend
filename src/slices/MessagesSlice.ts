import { createSlice } from "@reduxjs/toolkit";

const MESSAGES_MAX_DISPLAY_DURATION = 60000;
let nb_messages = 0;

interface Message {
  id: number;
  title: string;
  text: string;
  severity: string;
  created: number;
  open: boolean;
}
interface MessagesState {
  items: Array<Message>;
}
// Adds a message to the store
const createMessage = function (state: MessagesState, severity: string, title: string, text: string) {
  let message: Message = {
    id: nb_messages++,
    severity,
    title,
    text,
    created: Date.now(),
    open: true,
  };
  state.items.push(message);
  state.items = state.items.slice(0);
};
const initialState: MessagesState = {
  items: [],
};
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Create an error message
    error(state, action) {
      createMessage(state, "error", "Error", action.payload);
    },
    // Create an information message
    info(state, action) {
      createMessage(state, "info", "Information", action.payload);
    },
    // Create an information message
    set(state, action) {
      state.items = action.payload;
    },
    // Close a message
    close(state, action) {
      state.items = state.items.map(message => {
        return message.id == action.payload.id ? Object.assign({}, message, { open: false }) : message;
      });
    },
    // Finds and removes obsolete messages
    handle_obsolete(state, action) {
      let activeMessages = state.items.filter(message => {
        return Date.now() - message.created < MESSAGES_MAX_DISPLAY_DURATION;
      });
      if (state.items.length != activeMessages.length) {
        state.items = activeMessages;
      }
    },
  },
});

export const { error, info, close, handle_obsolete } = messagesSlice.actions;

export default messagesSlice.reducer;