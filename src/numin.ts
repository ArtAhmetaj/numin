import RuntimeError from "./errors/runtime-error";
import Interpreter from "./interpreter";
import Parser from "./parser";
import Resolver from "./resolver";
import Scanner from "./scanner";
import Token from "./token";
import { TokenType } from "./token-type";
const fs = require('fs');

const interpreter = new Interpreter();
let hadError = false;
let hadRuntimeError = false;


function runFile(path: string): void {
    const lines = fs.readFileSync(path).toString();
    run(lines);
    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
}


function runPrompt(): void {
    //TODO: REPL, create later
}


function run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    if (hadError) return;
    const resolver = new Resolver(interpreter);
    resolver.resolve(statements);
    if(hadError) return;
    interpreter.interpret(statements);

}

export function error(line:number,message:string):void{
    report(line,"",message);
    
}

function report(line:number,where:string,message:string){
    console.log(`[line${line}] Error ${where}: ${message}`);
    hadError = true;
}

function errorToken(token:Token,message:string){
    if (token.type == TokenType.EOF) {
        report(token.line, " at end", message);
    } else {
        report(token.line, " at '" + token.lexeme + "'", message);
    }
}


function runtimeError(error:RuntimeError){
    console.error(error.message +"\n[line " + error.token.line +"]");

}

const args : Array<string> = process.argv.slice(2);


if(args.length > 1){
    //TODO: make a help command
    console.log("Used incorrectly");

}
else if(args.length ===1){
 runFile(args[0]);   
}


