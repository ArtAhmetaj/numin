import Expression from "../expressions/expression";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

export default class While extends Statement{
  readonly condition:Expression;
  readonly body:Statement;

  constructor(condition:Expression,body:Statement){
      super();
      this.condition = condition;
      this.body = body;
      
  }
  
    protected accept<T>(visitor: statementVisitor<T>): T {
        return visitor.visitWhileStatement(this);
    }

}