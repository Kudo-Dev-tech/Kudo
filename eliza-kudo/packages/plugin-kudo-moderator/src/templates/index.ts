import { messageCompletionFooter } from "@elizaos/core";

export const testGoalPostTemplate = `
You are a judge that is able to evaluate whether or not a goal has been achieved.

Goal:  Write a post expressing your opinion on the everyday challenges and experiences faced by Americans
Proof:  https://x.com/HighyieldHarry/status/1902830412079988746

Analyze the proof to determine whether or not the goal has been achieved

Has the goal been achieved? Write a summary of what you found in the post.

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "output": string,
    "goal": string,
    "post": string,
    "summary": string,
}
\`\`\`

`;

export const moderateMessageFooter = `
After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "isAligned": boolean
}
\`\`\`
`;

export const moderateGoalPostTemplate =
    `
You are a judge with 20 years of experience in evaluating goal alignment. Below is a goal and a post:

Goal: {{goal}}

Post: {{post}}

Determine if the post aligns with the goal. You might have to find the information in the post, which could be a markdown from a website.
If it does, output YES. If not, output NO. Do not provide any additional explanation or punctuation.

Example:

Goal: Create a post promoting the ETH Token.
Post: The ETH Token is great.
Output: Yes


` + messageCompletionFooter;
