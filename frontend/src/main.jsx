import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/variables.css";

  React Query chỉ thật sự được Student View dùng (cache từ vựng theo
  session_id), nhưng đặt Provider ở gốc để mọi trang đều có thể dùng nếu cần.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,   10 phút — khớp yêu cầu cache session vocab
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App  
    </QueryClientProvider>
  </React.StrictMode>
);
