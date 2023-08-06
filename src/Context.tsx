import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

interface MessageContextType {
  conversationHistory: any[];
  setConversationHistory: (messages: any[]) => void;
}

const MessageContext = createContext<MessageContextType>();

export function MessageContextProvider(props) {
  const [conversationHistory, setConversationHistory] = createStore<any[]>([]);
  return (
    <MessageContext.Provider
      value={{ conversationHistory, setConversationHistory }}
    >
      {props.children}
    </MessageContext.Provider>
  );
}
export function useMessageContext() {
  return useContext(MessageContext);
}
