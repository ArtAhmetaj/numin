import Expression from "../expressions/expression";
import Token from "../token";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

//TODO: check Return naming
export class ReturnStatement extends Statement{

    readonly keyword:Token;
    readonly value:Expression;
    constructor(keyword:Token,value:Expression){
        super();
        this.keyword = keyword;
        this.value = value;
    }
    accept<T>(visitor: statementVisitor<T>): T {
        return visitor.visitReturnStatement(this);
    }

}