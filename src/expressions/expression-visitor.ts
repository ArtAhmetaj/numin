export default interface ExpressionVisitor<T>{
    //TODO: add types when created
    visitAssignExpression(expr:any): T 
    visitBinaryExpression(binaryExpression:any): T
    visitCallExpression(callExpression:any):T
    visitGetExpression(getExpresssion:any):T
    visitGroupingExpression(groupingExpression:any):T
    visitLiteralExpression(literalExpression:any):T
    visitlogicalExpression(logicalExpression:any):T
    visitLogicalExpression(logicalexpression:any):T
    visitSetExpression(setExpression:any):T
    visitSuperExpression(superExpression:any):T
    visitThisExpression(thisExpression:any):T
    visitUnaryExpression(unaryExpression:any):T
    visitVariableExpressoin(variableExpression:any):T

}
