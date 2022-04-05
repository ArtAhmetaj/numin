import RuntimeError from "./errors/runtime-error";
import Token from "./token";

export default class Environment {
    readonly enclosing: Environment | null
    private readonly values: Record<string, any> = {}

    static fromRoot() {
        return new this(null);
    }

    constructor(enclosing: Environment | null) {
        this.enclosing = enclosing;
    }

    get(name: Token): any {
        if (this.values[name.lexeme]) {
            return this.values[name.lexeme];
        }

        if (this.enclosing) return this.enclosing?.get(name);

        throw new RuntimeError(name,
            `Variable with name ${name.lexeme} not defined.`);
    }


    assign(name: Token, value: any): void {
        if (this.values[name.lexeme]) {
            this.values[name.lexeme] = value;
            return;

        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value);
            return;
        }
        throw new RuntimeError(name, `Variable with name ${name.lexeme} not defined.`);
    }

    define(name: string, value: any): void {
        this.values[name] = value;
    }

    ancestor(distance: number):Environment {
        //TODO: check on integer runtime checking
        let environment: Environment | null = this;
        for (let i = 0; i < distance; i++) {
            if (environment != null && environment.enclosing != null) {
                environment = environment.enclosing;
                //TODO: error handling and extending runtime errors 
            }

        }
        return environment;

    }

    getAt(distance:number,name:string) :any{
        return this.ancestor(distance).values[name];
    }

    assignAt(distance:number,name:Token,value:any):void{
        this.ancestor(distance).values[name.lexeme] = value;
    }
}