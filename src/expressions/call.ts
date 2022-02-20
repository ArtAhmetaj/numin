import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Call extends Expression{
    readonly callee : Expression;
    readonly paren : Token;
    readonly callArguments: Array<Expression>

    constructor(callee:Expression,paren:Token,callArguments:Array<Expression>){
        super();
        this.callee=callee;
        this.paren=paren;
        this.callArguments = callArguments;
    }

    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitCallExpression(this);
    }

}