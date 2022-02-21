import interpreter from "./interpreter";
import NuminCallable from "./numin-callable";
import NuminFunction from "./numin-function";
import NuminInstance from "./numin-instance";

export default class NuminClass implements NuminCallable{
    readonly name:string;
    readonly superClass:NuminClass;
    private readonly methods:Record<string,NuminFunction>  = {};


    constructor(name:string,superClass:NuminClass,methods:Record<string,NuminFunction>){
        this.name = name;
        this.superClass = superClass;
        this.methods = methods;

    }


    findMethod(instance:NuminInstance,name:string):NuminFunction | null{
        if(this.methods[name]!==undefined){
            return this.methods[name].bind(instance);
        }

        if(this.superClass !=null){
            return this.superClass.findMethod(instance,name);

        }
        return null;
    }

    arity(): number {
        const initializer : NuminFunction = this.methods['init'];
        if(initializer === null) return 0;
        return initializer.arity();
    }
    call(interpreter: interpreter, argumentValues: any[]) {
        const instance = new NuminInstance(this);
        const initializer = this.methods['init'];
        if(initializer !==null){
            initializer.bind(instance).call(interpreter,argumentValues);
        }
    }

    toString():string{
        return `Class: ${this.name}`;

    }

    
}