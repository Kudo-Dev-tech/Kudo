import { messageCompletionFooter } from "@elizaos/core";

export const extractActionTemplate =
    // {{goals}}
    // "# Action Examples" is already included
    `You are an AI assistant helping translate goals into actionable steps.

    Current Goal: {{goal}}
    Available Actions: {{actions}}
    Context: {{context}}

    Only use actions from the available actions list.
    Ensure all required parameters are included.
    Provide clear reasoning for the chosen action.` + messageCompletionFooter;

export const extractGoalMessageTemplate = `You are an AI assistant specialized in extracting a goal and any data to help achieve the goal. Your task is to extract specific information from user messages and format it into a structured JSON response.
    First, the message to analyze:

    <recent_messages>
    {{message}}
    </recent_messages>

    Your goal is to extract the following information:
    1. The goal to be achieved
    2. Any data that is required to achieve the goal
    3. The token address to settle the covenant
    4. The settlement amount, which is the amount of tokens to settle the covenant
    5. The goal type.  This is given by the type field.  The goal will either be "LOAN" or "SOCIAL_INTERACTION"
    6. The price of the covenant NFT.  This is a required field and can be marked as 0 if it cannot be detected.
    7. The minimum ability score.  This is an integer greater than or equal to 0

    After your analysis, provide the final output in a JSON markdown block. All fields apart from data are required. The JSON should have this structure:

    \`\`\`json
    {
        "goal": string,
        "data": string | null,
        "tokenAddress": string,
        "settlementAmount": string
        "price": string
        "type": string
        "minAbilityScore": number
    }
    \`\`\`

    Now, process the user's request and provide your response.
    `;
