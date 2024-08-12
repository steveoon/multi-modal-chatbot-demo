"use client";
import { Message } from "ai";
import { useState } from "react";
import Markdown from "react-markdown";

const defaultMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "1+4=?",
  },
  {
    id: "2",
    role: "assistant",
    content: "1 + 4 equals 5.",
  },
  {
    id: "3",
    role: "user",
    content: "能看到图片吗",
    experimental_attachments: [
      {
        name: "IMG_6957.jpg",
        contentType: "image/jpeg",
        url: "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnK...",
      },
    ],
  },
];

function customParse(jsonString: string): any {
  return JSON.parse(jsonString, (key, value) => {
    if (value && typeof value === "object" && value.type === "Uint8Array") {
      return new Uint8Array(
        atob(value.data)
          .split("")
          .map((char) => char.charCodeAt(0))
      );
    }
    return value;
  });
}

async function getCoreMessages(messages: Message[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const data = customParse(JSON.stringify(await res.json()));
  return data;
}

export default function Home() {
  const [coreMessages, setCoreMessages] = useState([]);
  const [text, setText] = useState(JSON.stringify(defaultMessages, null, 2));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMessages = async () => {
    try {
      setError("");
      setLoading(true);
      const messages = JSON.parse(text);
      const res = await getCoreMessages(messages);
      setCoreMessages(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error));
      setCoreMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return "An unknown error occurred. See console for more details.";
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center font-mono text-sm">
        <p>test convertToCoreMessages.</p>
        <textarea
          className="border border-gray-500 rounded-md p-2 my-4 w-full max-w-5xl height-96 dark:bg-gray-800"
          rows={10}
          cols={30}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          "loading..."
        ) : (
          <button
            onClick={handleMessages}
            type="button"
            className="border border-gray-500 rounded-md p-2 my-4"
          >
            Convert
          </button>
        )}
        <pre className="max-w-5xl overflow-scroll border border-gray-400 rounded-md p-2">
          {JSON.stringify(coreMessages, null, 2)}
        </pre>
        {(coreMessages as any).error && (coreMessages as any).stack && (
          <div className="mt-4">
            <h3>Stack Trace:</h3>
            <Markdown>{(coreMessages as any).stack}</Markdown>
          </div>
        )}
      </div>
    </main>
  );
}
