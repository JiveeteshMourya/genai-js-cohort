import { get_encoding} from "tiktoken";

const encoderForGpt2 = get_encoding('gpt2');

const encoded = encoderForGpt2.encode("Hello, I Am Jiveetesh");

console.log(encoded);

const decoded = encoderForGpt2.decode(encoded);

console.log(decoded);
console.log(new TextDecoder().decode(decoded));