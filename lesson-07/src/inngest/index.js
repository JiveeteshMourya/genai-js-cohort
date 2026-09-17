import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// my functions
const helloAgentFunction = inngest.createFunction(
    {
        id: "hello-agent",
        triggers: [{event: "chai/hello.agent"}],
    },
    async function ({step}) {
        await step.run('collect-user-input', async() => {
            console.log("I am running and collecting user info")
            return {name: 'Jiveetesh', lastName: 'Mourya'}
        });

        await step.sleep('wait-for-research', '5s');

        await step.run('notification-agent', async () => {
            console.log('This is going to send a notification via Gmail');
            const zeroOrOne = Math.random() > 0.5 ? 1 : 0;
            if (zeroOrOne === 0) throw new Error('Something went wrong');
            console.log('Email has been sent');
            return {emailAck: true};
        });
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [helloAgentFunction];