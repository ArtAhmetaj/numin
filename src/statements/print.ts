import Expression from "../expressions/expression";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

export default class Print extends Statement{

    readonly expression:Expression;

    constructor(expression:Expression){
        super();
        this.expression=expression;
    }

    accept<T>(visitor: statementVisitor<T>): T {
     return   visitor.visitPrintStatement(this);
    }

}