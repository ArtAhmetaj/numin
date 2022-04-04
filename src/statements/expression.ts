import Expression from "../expressions/expression";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";



export default class StatementExpression  extends Statement{
   readonly expression:Expression;

   constructor(expression:Expression){
       super();
       this.expression=expression;
   }
   
    public accept<T>(visitor: statementVisitor<T>): T {
           return  visitor.visitExpressionStatement(this);
    }

}