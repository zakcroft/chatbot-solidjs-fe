import {
  createSignal,
  onCleanup,
  createEffect,
  createResource,
  Suspense,
  For,
  Show,
  onMount,
} from "solid-js";

import {
  apiEventSourceStream,
  getConversationHistory,
  createNewConversations,
  searchForAnswer,
  CURRENT_CONVERSATION_KEY,
  getOrCreateUserId,
} from "../api";
import { useMessageContext } from "../Context";
import { Spinner } from "../common/Spinner";
import * as DOMPurify from "dompurify";
import { AnimateEllipsis } from "../common/AnimateEllipsis";

export default function Home() {
  const [userId, setUserId] = createSignal(null);
  const [currentConversationId, setCurrentConversationId] = createSignal(null);
  const [searchText, setSearchText] = createSignal(null);
  const [triggerSearch, setTriggerSearch] = createSignal(null);

  const [showSearching, setShowSearching] = createSignal(false);
  const [streamLoading, setStreamLoading] = createSignal(false);

  const [syncResponse] = createResource(triggerSearch, searchForAnswer);
  const [streamResult, setStreamResult] = createSignal("");

  const [conversationHistoryResponse] = createResource(
    currentConversationId,
    getConversationHistory,
  );

  const { conversationHistory, setConversationHistory } = useMessageContext();

  // scrolling
  let chatPanelRef;

  const scrollChatWindowToBottom = () => {
    setTimeout(() => {
      chatPanelRef.scrollTop = chatPanelRef.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
  };

  createEffect(() => {
    if (showSearching()) {
      scrollChatWindowToBottom();
    }
  });

  let closeStream;

  onMount(async () => {
    const user_id = await getOrCreateUserId();
    setUserId(user_id);

    const current_conversation_id = localStorage.getItem(
      CURRENT_CONVERSATION_KEY,
    );
    if (!current_conversation_id) {
      const { conversation_id } = await createNewConversations();
      setCurrentConversationId(conversation_id);
    } else {
      setCurrentConversationId(current_conversation_id);
    }
  });

  createEffect(() => {
    if (conversationHistoryResponse()) {
      const { conversation_history } = conversationHistoryResponse();
      setConversationHistory(conversation_history);
      scrollChatWindowToBottom();
    }
  });

  createEffect(() => {
    if (syncResponse()) {
      const { conversation_history } = syncResponse();
      setConversationHistory(conversation_history);
      setShowSearching(false);
      setStreamResult("");
      scrollChatWindowToBottom();
    }
  });

  onCleanup(() => {
    if (closeStream) {
      closeStream();
    }
  });

  const search = async () => {
    closeStream = await apiEventSourceStream((data) => {
      setStreamLoading(false);
      scrollChatWindowToBottom();
      setStreamResult((prevStreamResult) => `${prevStreamResult}${data}`);
    });
    setShowSearching(true);
    setStreamLoading(true);
    await setTriggerSearch({ query: searchText() });
  };

  return (
    <>
      <section
        ref={chatPanelRef}
        class="bg-gray-200 text-gray-900 m-8 px-32 pb-4 pt-4 border border-black h-[78%] overflow-y-auto rounded-2xl "
      >
        <For each={conversationHistory}>
          {({ content, error }, index) => {
            let innerHTML = "";
            let file_info_objects = [];
            try {
              console.log(content);
              innerHTML = JSON.parse(content).response;
              file_info_objects = JSON.parse(content).file_info_objects;
            } catch {
              if (typeof content === "string") {
                innerHTML = content;
              } else {
                innerHTML = "";
              }
            }
            // console.log(content);
            // console.log("content.response===", content.response);
            // const clean = DOMPurify.sanitize(content)

            return (
              <div
                class={
                  "p-4 my-4 border border-black bg-gray-300 text-gray-900 rounded-lg"
                }
              >
                <Show when={!error} fallback={<div>{error}</div>}>
                  <span class={"text-black font-bold"}>
                    {index() % 2 === 0 ? "Assistant : " : "User : "}
                  </span>
                  <span
                    innerHTML={innerHTML}
                    class="whitespace-pre-wrap response"
                  />
                  <div
                    class={"mt-4"}
                    classList={{ hidden: !file_info_objects.length }}
                  >
                    <For each={file_info_objects}>
                      {({ page, href, name }, index) => {
                        return (
                          <div class={"mt-4 p-4 bg-white rounded w-1/4"}>
                            <span>Page: {page}</span> <a href={href}>{name}</a>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>

        <Show when={showSearching()}>
          <>
            <div
              class={
                "p-4 my-4 border border-black bg-gray-300 text-gray-900 rounded-lg"
              }
            >
              <span class={"text-black font-bold"}>{"User : "}</span>
              <span class="whitespace-pre-wrap">{searchText()}</span>
            </div>
            <div
              class={
                "p-4 my-4 border border-black bg-gray-300 text-gray-900 rounded-lg"
              }
            >
              <span class={"text-black font-bold"}>{"Assistant : "}</span>{" "}
              {streamLoading() ? (
                <AnimateEllipsis classes={"font-bold text-2xl"} />
              ) : null}
              <span
                class="whitespace-pre-wrap response"
                innerHTML={streamResult()}
              />
            </div>
          </>
        </Show>
      </section>

      <section class="bg-gray-100 text-gray-900 m-8 p-4 border border-gray-100 rounded-2xl flex justify-between">
        <div class={"flex items-center"}>
          <input
            class="bg-white text-gray-900 p-2 rounded w-[700px]"
            autocomplete={"off"}
            type="text"
            id="name"
            value={searchText()}
            onClick={(e) => (e.currentTarget.placeholder = "")}
            placeholder="Search"
            onInput={(e) => setSearchText(e.currentTarget.value)}
          />
          <button
            class="bg-white text-gray-900 border-black border-1 ml-8 p-2 rounded"
            onClick={async () => await search()}
          >
            Search
          </button>
          <Show when={streamLoading()}>
            <Spinner wrapperClasses={"ml-4"} />
          </Show>
        </div>
        <button
          class="p-2 rounded bg-gray-200 text-gray-700"
          onClick={async () => {
            const { conversation_id } = await createNewConversations();
            setCurrentConversationId(conversation_id);
          }}
        >
          New Chat
        </button>
      </section>
    </>
  );
}
