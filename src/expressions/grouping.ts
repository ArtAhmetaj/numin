import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Grouping extends Expression{

    readonly expression:Expression;

    constructor(expression:Expression){
        super();

        this.expression = expression;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitGroupingExpression(this);
    }

}

        throw new Error("Method not implemented.");
