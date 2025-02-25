export const extractTweetAndNFTID =
    // {{goals}}
    // "# Action Examples" is already included
    `You are an AI assistant specializing in analyzing the contents of the message.

    {{message}}

    Your goal is to extract the following information:

    1.  The nftID.  Assign this to the field nftId
    2.  The twitter link.  Assign this to the field tweetMessage

    \`\`\`json
    {
        "nftId": number
        "twitterLink": string
    }
    \`\`\`

    `;

export const extractIsValidSubject =
    // {{goals}}
    // "# Action Examples" is already included
    `You are an AI assistant specializing in analyzing the contents of the message.  The message is composed of two parts.  The
    first is the NFT ID and the second is the message content, surrounded by quotation marks.

    {{message}}

    Your goal is to extract the following information:

    1.  Whether or not the message content surrounded by quotation marks is greater than 10 characters.  Assign this to the field hasMetMinimumLength
    2.  Whether or not the message content surrounded by quotation marks says that an ecosystem is great.  Assign this to the field isPromotingToken
    3.  The NFT ID

    \`\`\`json
    {
        "hasMetMinimumLength": boolean,
        "isPromotingToken": boolean,
        "nftId": number
    }
    \`\`\`

    `;

export const extractTokenTemplate = `You are an AI assistant specialized in extracting the token to promote
    First, the message to analyze:

    <recent_messages>
    {{message}}
    </recent_messages>

    Your goal is to extract the following information:
    1. The token to analyze
    2. The ability score.  This is an integer in between 0 and 10
    3. The chain to execute the transfer on.  This must be either "Arbitrum One" or "Sonic"

    After your analysis, provide the final output in a JSON markdown block. All fields apart from data are required. The JSON should have this structure:

    \`\`\`json
    {
        "token": string
        "abilityScore": number
        "chain": string
    }
    \`\`\`

    Now, process the user's request and provide your response.
    `;

export const extractTargetCovenantNFTID = `You are an AI assistant specialized in extracting the token to promote
    First, the message to analyze:

    <recent_messages>
    {{message}}
    </recent_messages>

    Your goal is to extract the following information:
    1. The target covenant NFT ID
    2. The chain to execute the transfer on.  This must be either "Arbitrum One" or "Sonic"

    After your analysis, provide the final output in a JSON markdown block. All fields apart from data are required. The JSON should have this structure:

    \`\`\`json
    {
        "targetCovenantID": number,
        "chain": string
    }
    \`\`\`

    Now, process the user's request and provide your response.
    `;

export const extractResponseTemplate = `You are an AI assistant specialized in extracting the nftId

    <recent_messages>
    {{message}}
    </recent_messages>

    Your goal is to extract the following information:
    1. The target covenant NFT ID
    2. The chain to execute the transfer on.  This must be either "Arbitrum One" or "Sonic"

    After your analysis, provide the final output in a JSON markdown block. All fields apart from data are required. The JSON should have this structure:

    \`\`\`json
    {
        "nftId": number
        "chain": string
    }
    \`\`\`

    Now, process the user's request and provide your response.
    `;

export const extractSocialInteractionTargetTemplate = `You are an AI assistant specialized in determining what the contents of a post. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the message {{message}}

Your goal is to extract the following information about the twitter post:
1. The content of the post.  This should exclude the maturity date
2. The NFT ID
3. The chain to execute the transfer on.  This must be either "Arbitrum One" or "Sonic"

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:

\`\`\`json
{
    "nftId": number
    "post": string
    "chain": string
}
\`\`\`

Remember:
- The amount should be a string representing the number without any currency symbol.

Now, process the user's request and provide your response.
`;
