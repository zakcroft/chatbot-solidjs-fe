import { createEffect, createResource, createSignal, Show } from "solid-js";
import { Spinner } from "./Spinner";
import { searchForAnswer, fileUpload } from "../api";

function FileUploader() {
  const [files, setFiles] = createSignal(null);
  const [result] = createResource(files, fileUpload);
  const handleFileChange = (e) => {
    const data = new FormData();
    Array.from(e.target.files).forEach((file) =>
      data.append("file", file as Blob),
    );

    setFiles(data);
  };

  createEffect(() => {
    if (result()) {
      setFiles(null);
    }
  });

  return (
    <div class={"flex items-center"}>
      <input
        class={"p-2 rounded"}
        type="file"
        multiple
        onChange={handleFileChange}
      />
      <Show when={result.loading}>
        <Spinner wrapperClasses={"ml-4"} />
      </Show>
    </div>
  );
}

export default FileUploader;
