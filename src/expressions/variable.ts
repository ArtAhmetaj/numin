import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Variable extends Expression {

    readonly name: Token;

    constructor(name: Token) {
        super();
        this.name = name;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitVariableExpression(this);
    }

}