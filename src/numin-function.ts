import Environment from "./environment";
import Return from "./errors/return";
import Interpreter from "./interpreter";
import NuminCallable from "./numin-callable";
import NuminInstance from "./numin-instance";
import Function from "./statements/function";

export default class NuminFunction implements NuminCallable {
    private readonly declaration: Function;
    private readonly closure: Environment;
    private readonly isInitializer: boolean;


    constructor(declaration: Function, closure: Environment, isInitializer: boolean) {
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }



    bind(instance:NuminInstance) : NuminFunction{
        const environment = new Environment(this.closure);
        environment.define("this",instance);
        return new NuminFunction(this.declaration,environment,this.isInitializer);
    }

    toString(): string {
        return `Function: ${this.declaration.name.lexeme}`;
    }

    arity(): number {
        return this.declaration.parameters.length;
    }
    call(interpreter: Interpreter, argumentValues: any[]) {
        const environment: Environment = new Environment(this.closure);
        for (let i = 0; i < this.declaration.parameters.length; i++) {
            environment.define(this.declaration.parameters[i].lexeme, argumentValues[i]);
            try {
                interpreter.executeBlock(this.declaration.body, environment);
            }
            catch (returnValue: any) {
                const returnError = returnValue as Return;
                return returnError.value;
            }

            if(this.isInitializer) return this.closure.getAt(0,"this");
            return null;
        }

    }

}