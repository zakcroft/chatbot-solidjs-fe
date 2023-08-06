import FileUploader from "../common/FileUploader";

export default function FileUpload() {
  return (
    <section class="bg-gray-700 text-gray-200 p-8">
      <h1 class="text-2xl font-bold">File upload</h1>
      <FileUploader />
    </section>
  );
}
