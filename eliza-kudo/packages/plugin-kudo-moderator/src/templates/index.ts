import { messageCompletionFooter } from "@elizaos/core";

export const moderateGoalPostTemplate = `
You are a judge with 20 years of experience in evaluating goal alignment. Below is a goal and a post:

Goal: {{goal}}

Post: {{post}}

Determine if the post aligns with the goal. If it does, output YES. If not, output NO. Do not provide any additional explanation or punctuation.

Example:

Goal: Create a post promoting the ETH Token.
Post: The ETH Token is great.
Output: YES

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "output": string,
    "goal": string,
    "post": string
}
\`\`\`

`;
