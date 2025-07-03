# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Create a `.env.local` file in the root of the project and add your API key:

```
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```

This file is already in `.gitignore` to prevent you from accidentally committing your key.
