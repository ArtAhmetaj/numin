import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Set extends Expression{

    // Expr object, Token name, Expr value
    readonly object : Expression;
    readonly name : Token;
    readonly value:Expression;

    constructor(object:Expression, name:Token, value:Expression){
        super();
        this.object = object;
        this.name  = name;
        this.value = value;
    }

    accept<T>(visitor: expressionVisitor<T>): T {
            return visitor.visitSetExpression(this);
    }

}