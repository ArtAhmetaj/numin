import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Unary extends Expression{

    readonly operator:Token;
    readonly right : Expression;

    constructor(operator:Token,right:Expression){
        super();
        this.operator = operator;
        this.right = right;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitUnaryExpression(this);
    }

}