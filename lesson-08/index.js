import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

const server = new McpServer({ name: 'chai-mcp-server', version: '1.0.0' });

server.registerTool(
    'add',
    {
        title: 'add',
        description: "Adds two numbers",
        inputSchema: z.object({num1: z.number(), num2: z.number()}),
    },
    async (context) => {
        return {
            content: [{type: 'text', text: `${context.num1 + context.num2}`}],
        };
    },
);

async function runServerOnStdIOTransport() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServerOnStdIOTransport();