import type { Component } from "solid-js";
import { Link, useRoutes, useLocation } from "@solidjs/router";

import { routes } from "./routes";
import { MessageContextProvider } from "./Context";

const App: Component = () => {
  const location = useLocation();
  const Route = useRoutes(routes);

  return (
    <>
      <nav class="bg-gray-200 text-gray-900 px-4">
        <ul class="flex items-center">
          <li class="py-2 px-4">
            <Link href="/" class="no-underline hover:underline">
              Home
            </Link>
          </li>
          <li class="py-2 px-4">
            <Link href="/file-upload" class="no-underline hover:underline">
              File upload
            </Link>
          </li>
        </ul>
      </nav>

      <main class={"h-[calc(100dvh-100px)]"}>
        <MessageContextProvider>
          <Route />
        </MessageContextProvider>
      </main>
    </>
  );
};

export default App;
