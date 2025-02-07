export const extractMinBalanceTemplate = `You are an AI assistant specialized in extracting the minimum balance you should have. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the requested transfer:
1. Minimum balance amount (denominated in the token, without the coin symbol)
2. Token symbol or address (if not a native token transfer)
3. The token address on Arbitrum One
4. The number of token decimals on Arbitrum One

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "amount": string,
    "token": string,
    "tokenAddress": string,
    "tokenDecimals": number
}
\`\`\`

Remember:
- The amount should be a string representing the number without any currency symbol.

Now, process the user's request and provide your response.
`;

export const extractRepaymentParamsTemplate = `You are an AI assistant specialized in facilitating ERC20 token transfers. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the requested transfer:
1. The amount of coins to transfer (denominated in the coin, without the coin symbol)
2. Token symbol or address (if not a native token transfer)
3. The token address on Arbitrum One
4. The number of token decimals on Arbitrum One

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "nftId": number
    "amount": string,
    "token": string,
    "tokenAddress": string,
    "tokenDecimals": number
}
\`\`\`

Remember:
- The amount should be a string representing the number without any currency symbol.

Now, process the user's request and provide your response.
`;
