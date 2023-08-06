const API_IRL = "http://0.0.0.0:80";
export const USER_ID_KEY = "USER_ID_KEY";
export const CURRENT_CONVERSATION_KEY = "CURRENT_CONVERSATION_KEY";

import { v4 as uuidv4 } from "uuid";

const postFetch = async ({ endpoint, body }) =>
  await fetch(`${API_IRL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

const handeFetchText = (response) => response.text();
const parseData = (data) => JSON.parse(data).results;
const apiFetch = async (
  { endpoint, body }: { endpoint: string; body?: any },
  cb,
) => {
  return await postFetch({ endpoint, body }).then(handeFetchText).then(cb);
};

export const searchForAnswer = async ({ query }) => {
  const user_id = localStorage.getItem(USER_ID_KEY);
  const conversation_id = localStorage.getItem(CURRENT_CONVERSATION_KEY);
  return apiFetch(
    { endpoint: "query", body: { query, user_id, conversation_id } },
    (data) => {
      return JSON.parse(data).results;
    },
  );
};

export const getOrCreateUserId = async () => {
  const user_id = localStorage.getItem(USER_ID_KEY);
  if (!user_id) {
    return await fetch(`${API_IRL}/create-new-user-id`)
      .then(handeFetchText)
      .then((data) => {
        const { results } = JSON.parse(data);
        const user_id = results?.user_id;
        localStorage.setItem(USER_ID_KEY, user_id);
        return user_id;
      });
  } else {
    return user_id;
  }
};

export const createNewConversations = async () => {
  const user_id = localStorage.getItem(USER_ID_KEY);
  const conversation_id = uuidv4();
  localStorage.setItem(CURRENT_CONVERSATION_KEY, conversation_id);
  const res = await postFetch({
    endpoint: "create-new-conversation",
    body: { user_id, conversation_id },
  });
  const data = await handeFetchText(res);
  return JSON.parse(data).results;
};

export const getConversationHistory = async (conversation_id: string) => {
  const user_id = localStorage.getItem(USER_ID_KEY);
  if (user_id && conversation_id) {
    return await fetch(
      `${API_IRL}/conversation-history/${user_id}:${conversation_id}`,
    )
      .then(handeFetchText)
      .then(async (data) => {
        const { results } = JSON.parse(data);
        return results;
      });
  } else {
    return false;
  }
};

export const fileUpload = async (body) => {
  return fetch(`${API_IRL}/file/upload`, {
    method: "POST",
    body,
  });
};

// Stream
export const apiEventSourceStream = async (onMessage) => {
  let eventSource;
  const END_MARKER = "[END]";
  const url = `${API_IRL}/query-stream`;

  eventSource = new EventSource(url);

  eventSource.onmessage = ({ data }) => {
    if (data !== END_MARKER) {
      onMessage(JSON.parse(data));
    } else if (data === END_MARKER) {
      // Request is closed by our servers once `[END]` is sent,
      // you must close the request otherwise the browser will keep retrying the URL.
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    console.error("EventSource error: ", error);
    eventSource.close();
  };

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
};
