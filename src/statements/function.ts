import Token from "../token";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

export default class Function extends Statement{
    readonly name : Token;
    readonly parameters:Array<Token>;
    readonly body : Array<Statement>;
    
    constructor(name:Token, parameters:Array<Token>, body:Array<Statement>){
        super();
        this.name = name;
        this.parameters = parameters;
        this.body = body;

    }
    protected accept<T>(visitor: statementVisitor<T>): T {
     return visitor.visitFunctionStatement(this);
    }

}
