RESPONA – A Web-Based Voice-Activated Personal Assistant
A smart voice assistant web application with chat, speech-to-text, and task management.

Introduction
RESPONA is a web-based personal assistant designed to enhance productivity and multitasking. It supports voice-activated commands, chat-based interaction, text-to-speech (TTS), and speech-to-text (STT). Users can manage background tasks such as reminders and calendar events through a clean, beginner-friendly interface built with modern web technologies.

🎯 Objectives
- Design and build a web-based assistant with both voice and text input/output.
- Implement task management features such as reminders, notes, and calendar integration.
- Integrate speech-to-text and text-to-speech for smooth communication.
- Demonstrate the use of modern web technologies (Next.js, TypeScript, RAG, TTS/STT APIs).
- Provide a user-friendly chat interface supporting intuitive workflows.

🛠️ Project Description
 Functional Requirements
- Chat Interaction: Users can type or speak commands in a simple chat interface.
- Voice Activation: Voice commands trigger tasks hands-free.
- Speech-to-Text (STT): Converts user speech into text for processing.
- Text-to-Speech (TTS): Reads assistant responses aloud.
- Background Tasks: Set reminders, manage calendars, and handle routine activities.
🚫 Limitations
- Online-only application.
- No login or authentication system required.
📝 Implementation Note
Project initialized using create-next-app. Includes a health check route at /health for uptime monitoring.

🧠 Data Structures & Algorithms
- State Management: In progress
- Queues/Stacks: In progress
- RAG (Retrieval-Augmented Generation): In progress

🎨 Design
a. User Interface
- Central chat panel for interaction (text + voice)
- Microphone button for voice input
- Text field for manual input
- Text display + TTS playback
- Sidebar for reminders, notes, and calendar events
- Minimalist, responsive layout
b. Workflow
- Input Handling: Speech or text
- Processing:
- STT converts speech to text
- Text/audio sent to AI engine + task manager
- Task Execution: Assistant processes queries
- Output:
- Text response in chat
- TTS generates spoken feedback

✅ Expected Outcomes
- Real-time voice and text-based interaction
- Task management (reminders, notes, calendar)
- Smooth communication via TTS and STT
- Demonstrates modern frameworks (Next.js + TypeScript)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Rate Limiting (Upstash Redis)

This project enforces a simple IP-based rate limit on all tRPC API requests using Upstash Redis.

Configuration:
- Set the following environment variables (e.g. in .env):
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN

Defaults:
- Sliding window: 60 requests per 10 minutes per IP.
- You can adjust this in src/server/ratelimit.ts.

Behavior:
- When the limit is exceeded, the API responds with HTTP 429 and headers:
  - Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Design v1

- [System Maps (L1 + L2)](https://docs.google.com/document/d/121FQGUCzSIYmAcyWfeq_F5QPpDdYMGm5aEYwHfKUrp4/edit?usp=sharing)  
- [Data Model](https://docs.google.com/document/d/1wh0MApUxmwA-WRKEe4LjJ5kPOvd7w4W80MvwFNkq04Q/edit?usp=sharing)  
- [OpenAPI Spec](/api/openapi.yaml)  
- [Flows & Wireframes](https://docs.google.com/document/d/1NqTkIoExfeHdQQzjwcs6-yYCCd-fcqBDczxfK6bXvYw/edit?usp=sharing)  
- [Code Standards](https://docs.google.com/document/d/1LfRK4KX2-sKMGjIbWGpKZFOwAGUFge61TwbLkkrzzSc/edit?usp=sharing)  
- [Risk Log](https://docs.google.com/document/d/1bEqYm4al8r5vGDpxX-hkITwb0lO48-6fnfomyd1CcaI/edit?usp=sharing)


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
