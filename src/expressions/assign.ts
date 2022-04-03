import Token from "../token";
import Expression  from "./expression";
import expressionVisitor from "./expression-visitor";

export default class Assign extends Expression{

    readonly name:Token;
    readonly value:Expression
    constructor(name:Token,value:Expression){
        super();
        this.name = name;
        this.value = value;
    }
    accept<T>(visitor: expressionVisitor<T>): T {
       return visitor.visitAssignExpression(this);
    }

}