import ExpressionVisitor from "./expression-visitor";

export default abstract class Expression{
    abstract accept<T>(visitor:ExpressionVisitor<T>) : T;
}