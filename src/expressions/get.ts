import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Get extends Expression {

    readonly object: Expression;
    readonly name: Token;

    constructor(object: Expression, name: Token) {
        super();
        this.object = object;
        this.name = name;
    }

    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitGetExpression(this);

    }

}