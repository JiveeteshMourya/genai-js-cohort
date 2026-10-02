import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod';
import { createMcpExpressApp } from '@modelcontextprotocol/express';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';

const server = new McpServer({ name: 'tea-mcp-server', version: '1.0.0' });

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
server.registerTool(
    'subtract',
    {
        title: 'subtract',
        description: "Subtracts two numbers",
        inputSchema: z.object({num1: z.number(), num2: z.number()}),
    },
    async (context) => {
        return {
            content: [{type: 'text', text: `${context.num1 - context.num2}`}],
        };
    },
);

async function runServerOnHttpTransport() {
    const app = createMcpExpressApp();

    app.use('/mcp', async (req, res) => {
        // Stateless example: create a transport per request.
        // For stateful mode (sessions), keep a transport instance around and reuse it.
        const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    });

    app.listen(3000, () => console.log("Server is running on PORT 3000"));
}

runServerOnHttpTransport();