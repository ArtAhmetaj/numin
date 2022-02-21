import Token from "../token";
import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Super extends Expression{
    // keyword method tokens

    readonly keyword:Token;
    readonly method:Token;

    constructor(keyword:Token,method:Token){
        super();
        this.keyword = keyword;
        this.method = method
        }
    
    accept<T>(visitor: expressionVisitor<T>): T {
       return visitor.visitSuperExpression(this);
    }

}