import Token from "../token";
import Expression  from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Asign extends Expression{

    readonly token:Token;
    readonly value:Expression
    constructor(token:Token,value:Expression){
        super();
        this.token = token;
        this.value = value;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
       return visitor.visitAssignExpression(this);
    }

}