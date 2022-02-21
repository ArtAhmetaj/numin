import RuntimeError from "./errors/runtime-error";
import NuminClass from "./numin-class";
import Token from "./token";

export default class NuminInstance {
    private clazz: NuminClass;
    private readonly fields : Record<string,any> = {};

    
    constructor(clazz : NuminClass){
        this.clazz = clazz;
    }


    get(name:Token) : any{
        if(this.fields[name.lexeme]!==undefined){
        return this.fields[name.lexeme];
        }
    

        const method = this.clazz.findMethod(this,name.lexeme);
        if(method!==null) return method;

        throw new RuntimeError(name,`Undefined property: ${name.lexeme}`);
    }


    set(name:Token,value:Object) {
        this.fields[name.lexeme] = value;
    }

    toString():string{
        return `Instance of ${this.clazz.name}`;


    }


}