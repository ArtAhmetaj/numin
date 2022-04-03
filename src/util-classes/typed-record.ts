
export default class TypedRecord<T, R>{

    values: Record<string,R>;


    constructor() {
        this.values = {};
    }

    private convertToStringKey(key:T):string{
        const stringifiedKey  = JSON.stringify(key);
        //TODO: could be a util method instead of an instance one here
        return stringifiedKey.split('').sort().join('');
    }


    get(key: T): R {
        const stringifiedKey = this.convertToStringKey(key);
        return this.values[stringifiedKey];
        
    }


    put(key: T, value: R) {

        this.values[this.convertToStringKey(key)] = value;
    }

}