# Chat AI application

You are a frontend expert with extended knowledge in how to integrate APIs into JS applications.

## Technical stack

Create nextjs application with the following stack:

- nextjs 13.4
- google/genai npm package
- tailwind css

## Summary

The application in summary is a chat that integrates with Google Gemini API.

## Requirements

1. It should allow the users to enter a prompt in a text component, and send the request to Gemini API and render the response.
2. This will be in this firt iteration just a single prompt/response, with no history and no multichat.
3. There is no requirement to server this site with SSL or to authenticate.
   The API key to use for Gemini should be provided in an `.env` file, provide an .env.example file.
4. The documentation to consume the API should be obtained from https://ai.google.dev/gemini-api/docs#javascript
5. The response should use structured content output.
6. The code should be production ready, the build tool is the nextjs cli
7. Create unit tests to cover the render components behavior and mock the API calls.
8. Use at least node version 20.11
9. Create one commit with the corresponding message for each step.
