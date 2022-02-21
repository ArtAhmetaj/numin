import Expression from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Literal extends Expression{
    value : any;

    constructor(value:any){
        super();
        this.value = value;
    }

    accept<T>(visitor: expressionVisitor<T>): T {
       return visitor.visitLiteralExpression(this);
    }

}