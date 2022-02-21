import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Logical extends Expression{
    readonly left:Expression;
    readonly operator:Token;
    readonly right:Expression;

    constructor(left:Expression,operator:Token,right:Expression){
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: expressionVisitor<T>): T {
      return visitor.visitlogicalExpression(this);
    }

}