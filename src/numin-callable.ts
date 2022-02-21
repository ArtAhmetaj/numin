import Interpreter from "./interpreter";

export default interface NuminCallable{
    arity() : number;
    call(interpreter:Interpreter,argumentValues:Array<any>) : any;
}