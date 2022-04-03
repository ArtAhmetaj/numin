import Interpreter from "../interpreter";
import NuminCallable from "../numin-callable";

class Clock implements NuminCallable{
    arity(): number {
        return 0;
    }
    call(interpreter: Interpreter, argumentValues: any[]) : any {
       return  new Date().getMilliseconds()/ 1000;
    }

}

export default new Clock();