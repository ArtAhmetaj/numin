import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class This extends Expression{
    readonly keyword:Token;

    constructor(keyword:Token){
        super();
        this.keyword = keyword;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
        return visitor.visitThisExpression(this);
    }

}